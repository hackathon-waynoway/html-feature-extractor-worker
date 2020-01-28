
class Sentiment:
    NEGATIVE = "NEGATIVE"
    NEUTRAL = "NEUTRAL"
    POSITIVE = "POSITIVE"


class Review: 
    def __init__(self, text, score): 
        self.text = text
        self.score = score 
        self.sentiment = self.get_sentiment()

    def get_sentiment(self):
        if self.score <= 2: 
            return Sentiment.NEGATIVE
        elif self.score == 3:
            return Sentiment.NEUTRAL
        else: 
            return Sentiment.POSITIVE