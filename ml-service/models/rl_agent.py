"""
rl_agent.py — Q-Learning Trading Agent (Reinforcement Learning)
================================================================
Implements a tabular Q-learning agent that learns to trade stocks.

Why Q-Learning?
  - Simple, interpretable RL algorithm
  - No neural network needed (tabular approach)
  - Converges for discrete state/action spaces
  - Demonstrates RL concepts clearly for academic evaluation

State Space:
  - Price change bins: [large_drop, small_drop, flat, small_rise, large_rise]
  - Position: [no_position, holding]
  → 5 × 2 = 10 discrete states

Action Space:
  - Buy, Sell, Hold → 3 actions

Reward:
  - Buy: 0 (delayed reward)
  - Sell: realized profit/loss
  - Hold: small penalty (opportunity cost)

Time Complexity: O(episodes × n) for training
Space Complexity: O(states × actions) = O(10 × 3) = O(1)
"""

import numpy as np
import logging

logger = logging.getLogger(__name__)


class QLearningTrader:
    """Tabular Q-learning agent for stock trading."""
    
    def __init__(self, learning_rate=0.1, discount_factor=0.95,
                 epsilon=1.0, epsilon_decay=0.995, epsilon_min=0.01):
        self.lr = learning_rate
        self.gamma = discount_factor
        self.epsilon = epsilon
        self.epsilon_decay = epsilon_decay
        self.epsilon_min = epsilon_min
        
        # State: (price_change_bin, position) → 5 bins × 2 positions = 10 states
        # Actions: 0=Hold, 1=Buy, 2=Sell
        self.n_states = 10
        self.n_actions = 3
        self.q_table = np.zeros((self.n_states, self.n_actions))
        
        # Price change bins: [-inf, -2%, -0.5%, 0.5%, 2%, inf]
        self.bins = [-0.02, -0.005, 0.005, 0.02]
    
    def _get_state(self, price_change, has_position):
        """Convert continuous price change + position to discrete state."""
        bin_idx = np.digitize(price_change, self.bins)  # 0-4
        position_idx = 1 if has_position else 0
        return bin_idx * 2 + position_idx
    
    def _choose_action(self, state):
        """Epsilon-greedy action selection."""
        if np.random.random() < self.epsilon:
            return np.random.randint(self.n_actions)
        return int(np.argmax(self.q_table[state]))
    
    def train(self, prices, episodes=100):
        """
        Train the Q-learning agent on historical prices.
        
        Returns:
            Training history with episode rewards
        """
        prices = np.array(prices, dtype=float)
        returns = np.diff(prices) / prices[:-1]  # Daily returns
        
        episode_rewards = []
        
        for ep in range(episodes):
            total_reward = 0
            has_position = False
            buy_price = 0
            
            for i in range(len(returns)):
                state = self._get_state(returns[i], has_position)
                action = self._choose_action(state)
                
                reward = 0
                # Execute action
                if action == 1 and not has_position:  # Buy
                    has_position = True
                    buy_price = prices[i + 1]
                    reward = -0.001  # Small transaction cost
                elif action == 2 and has_position:  # Sell
                    has_position = False
                    profit = (prices[i + 1] - buy_price) / buy_price
                    reward = profit
                elif action == 0:  # Hold
                    reward = -0.0001  # Tiny opportunity cost
                
                # Next state
                if i + 1 < len(returns):
                    next_state = self._get_state(returns[min(i + 1, len(returns) - 1)], has_position)
                    # Q-learning update
                    best_next = np.max(self.q_table[next_state])
                    self.q_table[state, action] += self.lr * (
                        reward + self.gamma * best_next - self.q_table[state, action]
                    )
                
                total_reward += reward
            
            # Decay epsilon
            self.epsilon = max(self.epsilon_min, self.epsilon * self.epsilon_decay)
            episode_rewards.append(total_reward)
        
        logger.info(f"RL training complete: {episodes} episodes, final reward={episode_rewards[-1]:.4f}")
        return episode_rewards
    
    def trade(self, prices):
        """
        Execute learned trading strategy on price data.
        
        Returns:
            Dict with actions, portfolio value, total profit
        """
        prices = np.array(prices, dtype=float)
        returns = np.diff(prices) / prices[:-1]
        
        actions = []
        has_position = False
        buy_price = 0
        cash = 10000.0  # Starting capital
        shares = 0
        portfolio_values = [cash]
        trades = []
        
        for i in range(len(returns)):
            state = self._get_state(returns[i], has_position)
            action = int(np.argmax(self.q_table[state]))  # Greedy (no exploration)
            
            action_name = 'Hold'
            
            if action == 1 and not has_position and cash > 0:
                # Buy
                buy_price = prices[i + 1]
                shares = cash / buy_price
                cash = 0
                has_position = True
                action_name = 'Buy'
                trades.append({
                    'type': 'Buy', 'day': i + 1,
                    'price': round(buy_price, 2), 'shares': round(shares, 4)
                })
            elif action == 2 and has_position:
                # Sell
                sell_price = prices[i + 1]
                cash = shares * sell_price
                profit_pct = ((sell_price - buy_price) / buy_price) * 100
                trades.append({
                    'type': 'Sell', 'day': i + 1,
                    'price': round(sell_price, 2),
                    'profit_pct': round(profit_pct, 2)
                })
                shares = 0
                has_position = False
                action_name = 'Sell'
            
            actions.append(action_name)
            portfolio_value = cash + shares * prices[min(i + 1, len(prices) - 1)]
            portfolio_values.append(round(portfolio_value, 2))
        
        # Final portfolio value
        final_value = cash + shares * prices[-1]
        total_return = ((final_value - 10000) / 10000) * 100
        
        # Buy & hold comparison
        buy_hold_return = ((prices[-1] - prices[0]) / prices[0]) * 100
        
        return {
            'actions': actions,
            'portfolio_values': portfolio_values,
            'trades': trades,
            'final_value': round(final_value, 2),
            'total_return_pct': round(total_return, 2),
            'buy_hold_return_pct': round(buy_hold_return, 2),
            'outperformed': total_return > buy_hold_return,
            'q_table': self.q_table.tolist(),
        }


def train_rl_agent(prices, episodes=200):
    """Convenience function to train and execute RL agent."""
    agent = QLearningTrader()
    training_rewards = agent.train(prices, episodes)
    results = agent.trade(prices)
    results['training_rewards'] = [round(r, 4) for r in training_rewards]
    return results
