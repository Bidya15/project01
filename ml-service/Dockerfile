FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
# Train the model if it doesn't exist (optional, usually pre-trained)
# RUN python train.py
EXPOSE 8000
CMD ["python", "main.py"]
