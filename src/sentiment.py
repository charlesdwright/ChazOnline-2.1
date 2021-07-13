# coding=utf-8
from nltk import download
from nltk.corpus import stopwords
from string import punctuation

import pickle
import sys

download("punkt")
download("stopwords")

stopwords_eng = stopwords.words("english")


def extract_features(words):
    return [w.lower() for w in words if w not in stopwords_eng and w not in punctuation]


def bag_of_words(words):
    bag = {}
    for w in words:
        bag[w] = bag.get(w, 0)+1
    return bag


if "google.colab" not in sys.modules:
    model_file = open("resources/sa_classifier.pickle", "rb")
    model = pickle.load(model_file)
    model_file.close()


def get_sentiment(review):
    words = extract_features(review)
    words = bag_of_words(words)
    return model.classify(words)
