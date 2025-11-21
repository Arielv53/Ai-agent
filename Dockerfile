# Python base image
FROM python:3.11-slim

# Prevent Python from writing .pyc files and enable unbuffered logs
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Set work directory
WORKDIR /app

# Install system dependencies (for some Python packages that may need build tools)
RUN apt-get update && apt-get install -y --no-install-recommends \
        build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt \
    && pip install --no-cache-dir \
        flask-sqlalchemy \
        flask-migrate \
        flask-cors \
        python-dotenv \
        pydantic \
        "langchain==0.2.17" \
        "langchain-openai==0.1.25" \
        "duckduckgo-search==7.2.1" \
        "langchain-community==0.2.19" \
        "langchain-text-splitters==0.2.4" \
        wikipedia \
        "dateparser==1.2.2" \
        "geopy==2.4.1" \
        gunicorn

# Copy backend source code
COPY server/ server/

# Expose the Flask port
EXPOSE 5000

# Default environment variables (you can override these at runtime)
ENV FLASK_ENV=production \
    PYTHONPATH=/app

# Start the app with Gunicorn (WSGI server)
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "server.app:app"]
