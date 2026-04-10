import nltk
from nltk.sentiment import SentimentIntensityAnalyzer
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from scipy.special import softmax
import torch

# Load VADER
sia = SentimentIntensityAnalyzer()

# Load RoBERTa
MODEL = "cardiffnlp/twitter-roberta-base-sentiment"
tokenizer = AutoTokenizer.from_pretrained(MODEL)
model = AutoModelForSequenceClassification.from_pretrained(MODEL)

def vader_sentiment(text):
    return sia.polarity_scores(text)

def roberta_sentiment(text):
    encoded_text = tokenizer(text, return_tensors='pt')
    output = model(**encoded_text)
    scores = output.logits[0].detach().numpy()
    scores = softmax(scores)

    return {
        "roberta_neg": float(scores[0]),
        "roberta_neu": float(scores[1]),
        "roberta_pos": float(scores[2])
    }

def analyze(text):
    vader = vader_sentiment(text)
    roberta = roberta_sentiment(text)

    return {
        "vader": vader,
        "roberta": roberta
    }