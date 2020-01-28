import json 
from review import Review
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import CountVectorizer 
import matplotlib.pyplot as plt 
import numpy as np


file_name = './data/sentiment/Books_small.json'

reviews = []
with open(file_name) as f:
    for line in f:
        review = json.loads(line)

        reviews.append(Review(review['reviewText'], review['overall']))

# print(reviews[5].text)

# Preg Data
training, test = train_test_split(reviews, test_size=0.33, random_state=42)

train_x = [x.text for x in training]
train_y = [x.sentiment for x in training]

test_x = [x.text for x in test]
test_y = [x.sentiment for x in test]

# Bag of words vectorization

vectorizer = CountVectorizer()
train_x_vectors = vectorizer.fit_transform(train_x)
# vectorizer.fit(train_x)
test_x_vectors = vectorizer.transform(test_x)

# print(test_x[0])
# print(train_x_vectors[0].toarray())

# print(test_x_vector[0].toarray())

#Linear 
from sklearn import svm
clf_svm = svm.SVC(kernel='linear')

clf_svm.fit(train_x_vectors, train_y)

predict_result = clf_svm.predict(test_x_vectors[0])

print (predict_result)

#############
# Fixing random state for reproducibility
np.random.seed(19680801)

N = 10000
x = np.random.rand(N)
y = np.random.rand(N)
colors = np.random.rand(N)
area = (30 * np.random.rand(N))**2  # 0 to 15 point radii
plt.scatter(x, y, s=area, c=colors, alpha=0.5)

############
 # figure = plt.figure(figsize=(27,9))
# plt.show()

### Logistic Regression 
from sklearn.linear_model import LogisticRegression
clf_log = LogisticRegression()

clf_log.fit(train_x_vectors, train_y)

predict_result = clf_log.predict(test_x_vectors[0])
print(predict_result)

### Decision Tree
from sklearn.tree import DecisionTreeClassifier
clf_dec = DecisionTreeClassifier()

clf_dec.fit(train_x_vectors, train_y)

predict_result = clf_dec.predict(test_x_vectors[0])
# print(predict_result)

### Naive Bayes
# from sklearn.naive_bayes import GaussianNB
 # clf_gnb = GaussianNB()

# clf_gnb.fit(train_x_vectors, train_y)

# predict_result2 = clf_gnb.predict(test_x_vectors[0])
# print(predict_result2)

svmScore = clf_svm.score(test_x_vectors, test_y)

# print (svmScore)