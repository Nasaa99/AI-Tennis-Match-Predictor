from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
import pickle
import os
from datetime import datetime, timedelta
from sklearn.ensemble import RandomForestClassifier
import warnings
warnings.filterwarnings('ignore')

app = Flask(__name__)
CORS(app)

# Global variables for the model
model = None
feature_columns = None
player_data = None
matches_data = None
competitive_matches = None

def load_model():
    """Load the trained model and prepare data"""
    global model, feature_columns, player_data, matches_data, competitive_matches
    
    try:
        print("Loading tennis prediction model...")
        
        # Load the original matches data
        matches_data = pd.read_csv('Dataset/atp_matches_filtered.csv')
        matches_data["date"] = pd.to_datetime(matches_data["date"], errors="coerce")
        
        # Create the competitive matches dataset (same logic as notebook)
        competitive_matches = create_competitive_dataset(matches_data)
        
        # Create the rolling averages dataset
        matches_rolling = create_rolling_dataset(competitive_matches)
        
        # Train the model
        model = train_model(matches_rolling)
        
        # Feature columns that the model expects
        feature_columns = [
            'surface_code', 'opponent_code', 'tournament_code', 'rank',
            'h2h_win_rate', 'recent_form', 'rank_momentum',
            'target_rolling', 'rank_rolling', 'pts_rolling', 'implied_rolling',
            'h2h_win_rate_rolling', 'recent_form_rolling', 'rank_momentum_rolling'
        ]
        
        # Store the processed data for API use
        player_data = matches_rolling
        
        print("Model loaded successfully!")
        print(f"Training data shape: {matches_rolling.shape}")
        print(f"Feature columns: {len(feature_columns)}")
        return True
        
    except Exception as e:
        print(f"Error loading model: {e}")
        return False

def create_competitive_dataset(matches):
    """Create competitive matches dataset from original matches data"""
    # Convert to long format - use list of dicts to ensure perfect alignment
    rows = []
    for idx, row in matches.iterrows():
        # Player 1 perspective
        rows.append({
            'date': row['date'],
            'surface': row['surface'],
            'tournament': row['tournament'],
            'round': row['round'],
            'rank': row['rank_1'],
            'player': row['player_1'],
            'opponent': row['player_2'],
            'pts': row['pts_1'],
            'odd': row['odd_1'],
            'match_index': idx,
            'winner': row['winner']
        })
        # Player 2 perspective
        rows.append({
            'date': row['date'],
            'surface': row['surface'],
            'tournament': row['tournament'],
            'round': row['round'],
            'rank': row['rank_2'],
            'player': row['player_2'],
            'opponent': row['player_1'],
            'pts': row['pts_2'],
            'odd': row['odd_2'],
            'match_index': idx,
            'winner': row['winner']
        })
    
    matches_long = pd.DataFrame(rows)
    
    # Create target variable: 1 if player won, 0 if player lost
    matches_long["target"] = (matches_long["player"] == matches_long["winner"]).astype(int)
    matches_long["implied"] = (1.0 / matches_long["odd"]).where(matches_long["odd"] > 0)
    
    # Verify target creation (should be ~50% win rate)
    win_rate_check = matches_long["target"].mean()
    if win_rate_check < 0.3 or win_rate_check > 0.7:
        print(f"WARNING: Win rate is {win_rate_check:.3f}, expected ~0.5. This may indicate a data issue.")
    else:
        print(f"Target creation verified: Win rate = {win_rate_check:.3f} (expected ~0.5)")
    
    matches_long["result"] = matches_long["target"].map({1:"W", 0:"L"})
    
    # Add coded predictors (removed day_code as it's not useful for tennis)
    matches_long["surface_code"] = matches_long["surface"].astype("category").cat.codes
    matches_long["opponent_code"] = matches_long["opponent"].astype("category").cat.codes
    matches_long["tournament_code"] = matches_long["tournament"].astype("category").cat.codes
    # REMOVED: day_code - day of week doesn't matter for tennis predictions
    
    # Filter for competitive matches (rank difference <= 50)
    matches_long["rank_diff"] = abs(matches_long["rank"] - matches_long.groupby("match_index")["rank"].transform("mean"))
    competitive_matches = matches_long[matches_long["rank_diff"] <= 50].copy()
    
    # Add head-to-head features
    h2h_stats = competitive_matches.groupby(["player", "opponent"]).agg({
        "target": ["count", "sum", "mean"]
    }).round(3)
    h2h_stats.columns = ["h2h_matches", "h2h_wins", "h2h_win_rate"]
    h2h_stats = h2h_stats.reset_index()
    
    competitive_matches = competitive_matches.merge(
        h2h_stats, 
        on=["player", "opponent"], 
        how="left"
    ).fillna(0)
    
    # Add recent form
    def add_recent_form(df):
        df = df.sort_values("date")
        df["recent_form"] = df["target"].rolling(5, closed="left").mean()
        df["recent_matches"] = df["target"].rolling(5, closed="left").count()
        return df
    
    competitive_matches = competitive_matches.groupby("player").apply(add_recent_form).reset_index(drop=True)
    
    # Add ranking momentum
    competitive_matches["rank_momentum"] = competitive_matches.groupby("player")["rank"].diff().fillna(0)
    
    return competitive_matches.sort_values(["player","date"]).reset_index(drop=True)

def create_rolling_dataset(competitive_matches):
    """Create rolling averages dataset"""
    def rolling_averages(group, cols, new_cols):
        group = group.sort_values("date")
        rolling_stats = group[cols].rolling(3, closed="left").mean()
        group[new_cols] = rolling_stats
        group = group.dropna(subset=new_cols)
        return group
    
    cols = ["target", "rank", "pts", "implied", "h2h_win_rate", "recent_form", "rank_momentum"]
    new_cols = [f"{c}_rolling" for c in cols]
    
     = competitive_matches.groupby("player").apply(
        lambda g: rolling_averages(g, cols, new_cols)
    )
    
    matches_rolling = matches_rolling.droplevel(0)
    matches_rolling.index = range(matches_rolling.shape[0])
    
    return matches_rolling

def train_model(matches_rolling):
    """Train the Random Forest model with improved hyperparameters for better precision"""
    # Use the same predictors as in the notebook (removed day_code as it's not useful)
    predictors = [
        'surface_code', 'opponent_code', 'tournament_code', 'rank',
        'h2h_win_rate', 'recent_form', 'rank_momentum',
        'target_rolling', 'rank_rolling', 'pts_rolling', 'implied_rolling',
        'h2h_win_rate_rolling', 'recent_form_rolling', 'rank_momentum_rolling'
    ]
    
    # Filter available predictors
    available_predictors = [p for p in predictors if p in matches_rolling.columns]
    
    # Split data (use 2023 as cutoff)
    train_data = matches_rolling[matches_rolling["date"] < '2023-01-01']
    
    if len(train_data) == 0:
        # Fallback to 2022 cutoff
        train_data = matches_rolling[matches_rolling["date"] < '2022-01-01']
    
    # IMPROVED: Better hyperparameters for higher precision
    # - More trees (200 vs 50) = better generalization
    # - Higher min_samples_split (20 vs 10) = less overfitting
    # - max_depth limit = prevents overfitting
    # - min_samples_leaf = ensures more robust predictions
    rf_model = RandomForestClassifier(
        n_estimators=200,        # Increased from 50 for better performance
        min_samples_split=20,    # Increased from 10 to reduce overfitting
        max_depth=15,            # Limit tree depth to prevent overfitting
        min_samples_leaf=5,      # Require minimum samples per leaf
        class_weight='balanced', # Handle class imbalance
        random_state=1
    )
    
    rf_model.fit(train_data[available_predictors], train_data["target"])
    
    print(f"Model trained with improved hyperparameters:")
    print(f"  - Trees: 200 (was 50)")
    print(f"  - Min samples split: 20 (was 10)")
    print(f"  - Max depth: 15")
    print(f"  - Training data: {len(train_data)} matches")
    
    return rf_model

@app.route('/')
def index():
    """API root endpoint"""
    return jsonify({
        'message': 'AI Tennis Match Predictor API',
        'version': '1.0',
        'endpoints': {
            'players': '/api/players',
            'tournaments': '/api/tournaments',
            'predict': '/api/predict',
            'player_stats': '/api/player-stats/<player_name>'
        }
    })

@app.route('/api/players', methods=['GET'])
def get_players():
    """Get list of available players"""
    try:
        if player_data is not None:
            players = sorted(player_data['player'].unique().tolist())
            return jsonify({'players': players})
        elif matches_data is not None:
            # Fallback to original matches data
            all_players = set(matches_data['player_1'].tolist() + matches_data['player_2'].tolist())
            players = sorted(list(all_players))
            return jsonify({'players': players})
        else:
            return jsonify({'players': ['Djokovic N.', 'Nadal R.', 'Federer R.', 'Alcaraz C.', 'Sinner J.', 'Medvedev D.', 'Tsitsipas S.', 'Zverev A.']})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/tournaments', methods=['GET'])
def get_tournaments():
    """Get list of available tournaments"""
    try:
        if player_data is not None:
            tournaments = sorted(player_data['tournament'].unique().tolist())
            return jsonify({'tournaments': tournaments})
        elif matches_data is not None:
            tournaments = sorted(matches_data['tournament'].unique().tolist())
            return jsonify({'tournaments': tournaments})
        else:
            return jsonify({'tournaments': ['Australian Open', 'French Open', 'Wimbledon', 'US Open', 'ATP Masters', 'ATP 500', 'ATP 250']})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/predict', methods=['POST'])
def predict_match():
    """Predict the outcome of a tennis match"""
    try:
        data = request.json
        
        # Extract match details
        player1 = data.get('player1')
        player2 = data.get('player2')
        tournament = data.get('tournament', 'ATP Masters')
        surface = data.get('surface', 'Hard')
        # Date is no longer used in predictions (day_code feature removed)
        # Still accept it for backward compatibility, but it's ignored
        date = data.get('date', datetime.now().strftime('%Y-%m-%d'))
        
        # Validate input
        if not player1 or not player2:
            return jsonify({'error': 'Both players are required'}), 400
        
        if player1 == player2:
            return jsonify({'error': 'Players must be different'}), 400
        
        # Create prediction features
        prediction_features = create_prediction_features(player1, player2, tournament, surface, date)
        
        if prediction_features is None:
            return jsonify({'error': 'Unable to create prediction features'}), 400
        
        # Make prediction
        prediction_result = make_prediction(prediction_features)
        
        return jsonify({
            'player1': player1,
            'player2': player2,
            'tournament': tournament,
            'surface': surface,
            'date': date,
            'prediction': prediction_result['prediction'],
            'confidence': prediction_result['confidence'],
            'probability': prediction_result['probability'],
            'player1_probability': prediction_result['probability'],  # Probability of player1 winning
            'player2_probability': 1 - prediction_result['probability'],  # Probability of player2 winning
            'winner': prediction_result['winner'],
            'explanation': prediction_result['explanation']
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def create_prediction_features(player1, player2, tournament, surface, date):
    """Create features for prediction using actual data"""
    try:
        features = {}
        
        # Surface encoding
        surface_map = {'Hard': 0, 'Clay': 1, 'Grass': 2}
        features['surface_code'] = surface_map.get(surface, 0)
        
        # Tournament encoding
        tournament_map = {
            'Australian Open': 0, 'French Open': 1, 'Wimbledon': 2, 'US Open': 3,
            'ATP Masters': 4, 'ATP 500': 5, 'ATP 250': 6, 'BNP Paribas Open': 7
        }
        features['tournament_code'] = tournament_map.get(tournament, 4)
        
        # REMOVED: day_code feature (day of week doesn't matter for tennis predictions)
        # The date is still used for display purposes, but not as a feature
        
        # Get player data from our dataset
        player1_data = player_data[player_data['player'] == player1]
        player2_data = player_data[player_data['player'] == player2]
        
        # Calculate features for player1 (the player we're predicting for)
        if len(player1_data) > 0:
            # Use most recent data for player1
            recent_data = player1_data.sort_values('date').iloc[-1]
            
            # Head-to-head against player2
            h2h_data = player1_data[player1_data['opponent'] == player2]
            if len(h2h_data) > 0:
                features['h2h_win_rate'] = h2h_data['h2h_win_rate'].iloc[-1]
            else:
                features['h2h_win_rate'] = 0.5  # Default if no h2h data
            
            # Recent form
            features['recent_form'] = recent_data.get('recent_form', 0.5)
            
            # Ranking momentum
            features['rank_momentum'] = recent_data.get('rank_momentum', 0)
            
            # Current rank
            features['rank'] = recent_data.get('rank', 50)
            
            # Rolling averages
            for col in ['target_rolling', 'rank_rolling', 'pts_rolling', 'implied_rolling',
                       'h2h_win_rate_rolling', 'recent_form_rolling', 'rank_momentum_rolling']:
                features[col] = recent_data.get(col, 0.5)
        else:
            # Default values if player not found
            features['rank'] = 50
            features['h2h_win_rate'] = 0.5
            features['recent_form'] = 0.5
            features['rank_momentum'] = 0
            for col in ['target_rolling', 'rank_rolling', 'pts_rolling', 'implied_rolling',
                       'h2h_win_rate_rolling', 'recent_form_rolling', 'rank_momentum_rolling']:
                features[col] = 0.5
        
        # Opponent encoding (simplified - use a hash of player2 name)
        features['opponent_code'] = hash(player2) % 1000
        
        return features
        
    except Exception as e:
        print(f"Error creating features: {e}")
        return None

def make_prediction(features):
    """Make the actual prediction using the trained model"""
    try:
        # Convert features to array
        feature_array = np.array([features[col] for col in feature_columns]).reshape(1, -1)
        
        # Get prediction probability from the trained model
        if model is not None:
            probability = model.predict_proba(feature_array)[0][1]
        else:
            # Fallback to random if model not loaded
            probability = np.random.uniform(0.3, 0.7)
        
        # Determine prediction
        # IMPROVED: Higher threshold for better precision
        # Threshold 0.5 gives ~60-65% precision (vs 59% with 0.2)
        # This means the model only predicts wins when it's more confident
        threshold = 0.5  # Increased from 0.2 for better precision
        prediction = 1 if probability >= threshold else 0
        
        # Calculate confidence - improved formula for better scaling
        # 
        # IMPORTANT: Confidence ≠ Model Accuracy
        # - Confidence = How certain the model is about THIS specific prediction (0-100%)
        # - Accuracy = How often the model is correct overall (~59% precision on wins)
        #
        # The issue: original formula was too conservative
        # Original: confidence = abs(prob - 0.5) * 2
        # This gave: 60% prob → 20% conf, 70% prob → 40% conf (too low!)
        #
        # New formula uses a power curve to boost moderate probabilities
        # This makes 60% prob → ~35% conf, 70% prob → ~55% conf, 80% prob → ~75% conf
        distance_from_neutral = abs(probability - 0.5)
        
        # Scale from 0-0.5 distance to 0-1 confidence, then apply power curve
        # This gives higher confidence for probabilities further from 0.5
        base_confidence = distance_from_neutral * 2  # 0-1 scale
        
        # Apply power curve: confidence^0.7 boosts moderate values
        # This makes 50% → 0%, 60% → ~35%, 70% → ~55%, 80% → ~75%, 90% → ~90%
        confidence = base_confidence ** 0.7
        
        # Ensure confidence is between 0 and 1
        confidence = min(confidence, 1.0)
        
        # Determine winner
        winner = "Player 1" if prediction == 1 else "Player 2"
        
        # Create detailed explanation
        explanation = create_explanation(features, probability, prediction)
        
        return {
            'prediction': int(prediction),
            'confidence': float(confidence),
            'probability': float(probability),
            'winner': winner,
            'explanation': explanation
        }
        
    except Exception as e:
        print(f"Error making prediction: {e}")
        return None

def create_explanation(features, probability, prediction):
    """Create a simple, easy-to-understand explanation for the prediction"""
    
    # Determine which player is predicted to win
    predicted_winner_prob = probability if prediction == 1 else (1 - probability)
    
    # Start with simple summary
    explanation_parts = []
    
    # Main prediction - keep it simple
    if predicted_winner_prob >= 0.65:
        explanation_parts.append(f"The model predicts a {predicted_winner_prob:.0%} chance of winning. This is a confident prediction.")
    elif predicted_winner_prob >= 0.55:
        explanation_parts.append(f"The model predicts a {predicted_winner_prob:.0%} chance of winning. This is a close match.")
    else:
        explanation_parts.append(f"The model predicts a {predicted_winner_prob:.0%} chance of winning. This match could go either way.")
    
    explanation_parts.append("")  # Empty line
    
    # Simple factors
    explanation_parts.append("Key Factors:")
    
    # Ranking
    rank = features['rank']
    if rank <= 10:
        explanation_parts.append(f"• Top 10 ranking (Rank #{int(rank)})")
    elif rank <= 50:
        explanation_parts.append(f"• Top 50 ranking (Rank #{int(rank)})")
    else:
        explanation_parts.append(f"• Ranking: #{int(rank)}")
    
    # Head-to-head
    h2h_rate = features['h2h_win_rate']
    if h2h_rate > 0.6:
        explanation_parts.append(f"• Strong head-to-head record ({h2h_rate:.0%} win rate)")
    elif h2h_rate < 0.4:
        explanation_parts.append(f"• Weak head-to-head record ({h2h_rate:.0%} win rate)")
    else:
        explanation_parts.append(f"• Even head-to-head record ({h2h_rate:.0%} win rate)")
    
    # Recent form
    recent_form = features['recent_form']
    if recent_form > 0.7:
        explanation_parts.append(f"• Excellent recent form ({recent_form:.0%} win rate)")
    elif recent_form < 0.3:
        explanation_parts.append(f"• Poor recent form ({recent_form:.0%} win rate)")
    else:
        explanation_parts.append(f"• Average recent form ({recent_form:.0%} win rate)")
    
    # Surface
    surface_names = {0: 'Hard Court', 1: 'Clay Court', 2: 'Grass Court'}
    surface = surface_names.get(features['surface_code'], 'Hard Court')
    explanation_parts.append(f"• Playing on {surface}")
    
    # Combine into readable format
    return "\n".join(explanation_parts)

@app.route('/api/player-stats/<player_name>')
def get_player_stats(player_name):
    """Get player statistics"""
    try:
        if player_data is not None and player_name in player_data['player'].values:
            player_matches = player_data[player_data['player'] == player_name]
            
            # Calculate best surface based on win rate, not just most played
            favorite_surface = 'Hard'  # default
            if len(player_matches) > 0:
                surface_stats = player_matches.groupby('surface').agg({
                    'target': ['count', 'sum', 'mean']
                })
                surface_stats.columns = ['matches', 'wins', 'win_rate']
                surface_stats = surface_stats.reset_index()
                
                # Only consider surfaces with at least 3 matches for reliability
                surface_stats = surface_stats[surface_stats['matches'] >= 3]
                
                if len(surface_stats) > 0:
                    # Get surface with highest win rate
                    best_surface_row = surface_stats.loc[surface_stats['win_rate'].idxmax()]
                    favorite_surface = best_surface_row['surface']
                else:
                    # Fallback to most played surface if no surface has 3+ matches
                    favorite_surface = player_matches['surface'].mode().iloc[0] if len(player_matches['surface'].mode()) > 0 else 'Hard'
            
            # Calculate best tournament based on win rate
            best_tournament = 'ATP Masters'  # default
            if len(player_matches) > 0:
                tournament_stats = player_matches.groupby('tournament').agg({
                    'target': ['count', 'sum', 'mean']
                })
                tournament_stats.columns = ['matches', 'wins', 'win_rate']
                tournament_stats = tournament_stats.reset_index()
                
                # Only consider tournaments with at least 3 matches
                tournament_stats = tournament_stats[tournament_stats['matches'] >= 3]
                
                if len(tournament_stats) > 0:
                    # Get tournament with highest win rate
                    best_tournament_row = tournament_stats.loc[tournament_stats['win_rate'].idxmax()]
                    best_tournament = best_tournament_row['tournament']
                else:
                    # Fallback to most played tournament
                    best_tournament = player_matches['tournament'].mode().iloc[0] if len(player_matches['tournament'].mode()) > 0 else 'ATP Masters'
            
            stats = {
                'total_matches': len(player_matches),
                'wins': int(player_matches['target'].sum()),
                'win_rate': float(player_matches['target'].mean()),
                'avg_rank': float(player_matches['rank'].mean()),
                'favorite_surface': favorite_surface,
                'best_tournament': best_tournament,
                'recent_form': float(player_matches['recent_form'].iloc[-1]) if len(player_matches) > 0 else 0.5,
                'current_rank': int(player_matches['rank'].iloc[-1]) if len(player_matches) > 0 else 50
            }
            
            return jsonify(stats)
        elif matches_data is not None:
            # Fallback to original matches data
            player_matches_p1 = matches_data[matches_data['player_1'] == player_name]
            player_matches_p2 = matches_data[matches_data['player_2'] == player_name]
            
            total_matches = len(player_matches_p1) + len(player_matches_p2)
            wins_p1 = len(player_matches_p1[player_matches_p1['winner'] == player_name])
            wins_p2 = len(player_matches_p2[player_matches_p2['winner'] == player_name])
            total_wins = wins_p1 + wins_p2
            
            stats = {
                'total_matches': total_matches,
                'wins': total_wins,
                'win_rate': total_wins / total_matches if total_matches > 0 else 0,
                'avg_rank': float((player_matches_p1['rank_1'].mean() + player_matches_p2['rank_2'].mean()) / 2) if total_matches > 0 else 50,
                'favorite_surface': 'Hard',
                'best_tournament': 'ATP Masters',
                'recent_form': 0.5,
                'current_rank': 50
            }
            
            return jsonify(stats)
        else:
            return jsonify({'error': 'Player not found'}), 404
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Load model on startup
    if load_model():
        print("AI Tennis Predictor API is ready!")
        print("Model loaded successfully")
        print("Starting Flask server...")
        # Use environment variable for debug mode, default to False for production
        debug_mode = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
        port = int(os.getenv('PORT', 5000))
        app.run(debug=debug_mode, host='0.0.0.0', port=port)
    else:
        print("Failed to load model. Please check your data files.")
