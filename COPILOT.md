# Trading Dashboard Copilot

This document explains the implementation of the Copilot chatbot feature in the trading dashboard.

## Overview

The Copilot is an AI-powered chatbot that helps users analyze trading opportunities, market conditions, and specific assets. It integrates with the existing technical analysis, fundamental catalyst, and market summary components of the dashboard.

## Features

- **Natural Language Understanding**: Users can ask questions in plain English about assets, market conditions, or trading strategies.
- **Contextual Analysis**: The Copilot analyzes the query to determine if it's asking about technical analysis, fundamental catalysts, market summary, or a combination.
- **Intelligent Responses**: Responses include relevant data, trading recommendations, and suggested entry/exit points when applicable.
- **Interactive Links**: From any response, users can directly navigate to the detailed dashboard views for further analysis.

## Technical Implementation

The Copilot consists of three main components:

1. **React UI Component (`src/components/Copilot.js`)**: Provides the user interface, including:
   - A floating button in the bottom-right corner
   - An expandable chat window
   - Message history
   - Input field for user queries

2. **Flask Backend Endpoint (`/api/copilot` in `api.py`)**: Processes user queries through:
   - Query interpretation using OpenAI
   - Data gathering from relevant endpoints (technical, fundamental, market)
   - Final response generation using OpenAI

3. **Structured Data Flow**:
   - User submits a question
   - OpenAI interprets the intent, identifies symbols, and timeframes
   - Backend fetches relevant data based on interpretation
   - OpenAI generates final response combining all available data
   - UI displays the response with actionable links to dashboard sections

## Query Flow

1. **Query Interpretation**: The system analyzes the intent behind questions like "Is it a good time to trade gold?" to determine:
   - Request type (technical, fundamental, market summary, general)
   - Symbol/asset mentioned (e.g., gold, SPY, BTC/USD)
   - Timeframe mentioned (day, week, month)
   - Primary intent (trading outlook, price prediction, market overview)

2. **Data Collection**: Based on the interpretation, the system collects:
   - Technical indicators if a specific asset is mentioned
   - Fundamental catalysts if relevant
   - Market summary data if applicable

3. **Response Generation**: 
   - Combines all data sources into a coherent, conversational response
   - Provides specific trading insights when appropriate
   - Suggests navigation to detailed dashboard sections

## Examples

Users can ask questions like:

- "Is it a good time to trade gold?"
- "What's the SPY trade outlook?"
- "Tell me about BTC/USD"
- "What happened in the market over the last month?"

## Integration with Existing Components

The Copilot integrates with:

- Technical Analysis tab for indicator data
- Fundamental Catalyst tab for news and event data
- Market Summary tab for overall market condition data

## Environment Variables

The Copilot uses these environment variables (already defined in `.env`):

- `OPENAI_API_KEY`: API key for OpenAI
- `OPENAI_MODEL_NAME`: Model name to use (e.g., "gpt-4-turbo")
- `API_BASE_URL`: Base URL for OpenAI API calls

## Future Enhancements

Potential future improvements:

- Chat history persistence
- User feedback on responses
- Integration with trading execution features
- More complex multi-turn conversations
- Custom user preferences for analysis style 