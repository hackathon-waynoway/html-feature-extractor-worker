# Examples From: https://www.dataquest.io/blog/sci-kit-learn-tutorial/
# Installing Requirements
# pip install seaborn
# pip install pandas
# pip install matplotlib
# pip install yellowbrick

#import necessary modules
import pandas as pd
#store the url in a variable
url = "https://raw.githubusercontent.com/vkrit/data-science-class/master/WA_Fn-UseC_-Sales-Win-Loss.csv"


# ##################################################################################
# Load Data
# ##################################################################################
# pands.read_scv() returns back a Dataframe (Tabular representaion of the csv data)
# Read in the data with `read_csv()`
sales_data = pd.read_csv(url)

# Using head() method with an argument which helps us to restrict the number of initial records that should be displayed
# sale_data_result_head2 = sales_data.head(n=2)
#print(sale_data_result_head2)

# Using .tail() method with an argument which helps us to restrict the number of initial records that should be displayed
# sales_data_results_tail2 = sales_data.tail(2)
# print(sales_data_results_tail2)

# using the dtypes() method to display the different datatypes available
# print (sales_data.dtypes)
# ##################################################################################

test = 0

if test == 1:
    # ##################################################################################
    # Data Visualizatio
    # ##################################################################################

    # import the seaborn module
    import seaborn as sns
    # import the matplotlib module
    import matplotlib.pyplot as plt
    # set the background colour of the plot to white
    sns.set(style="whitegrid", color_codes=True)
    # setting the plot size for all plots
    sns.set(rc={'figure.figsize':(11.7,8.27)})
    # create a countplot

    # print(sales_data['Route To Market'].head())
    # print(sales_data['Opportunity Result'].head())

    sns.countplot('Route To Market',data=sales_data,hue = 'Opportunity Result')
    # Remove the top and down margin
    sns.despine(offset=10, trim=True)
    # display the plot
    plt.show()
    # ##################################################################################

# ##################################################################################
# Preprocessind data for predications 
# ##################################################################################
#import the necessary module
from sklearn import preprocessing
# create the Labelencoder object
le = preprocessing.LabelEncoder()
#convert the categorical columns into numeric
#import the necessary module
from sklearn import preprocessing
# create the Labelencoder object
le = preprocessing.LabelEncoder()

#convert the categorical columns into numeric
sales_data['Supplies Subgroup'] = le.fit_transform(sales_data['Supplies Subgroup'])
sales_data['Region'] = le.fit_transform(sales_data['Region'])
sales_data['Route To Market'] = le.fit_transform(sales_data['Route To Market'])
sales_data['Opportunity Result'] = le.fit_transform(sales_data['Opportunity Result'])
sales_data['Competitor Type'] = le.fit_transform(sales_data['Competitor Type'])
sales_data['Supplies Group'] = le.fit_transform(sales_data['Supplies Group'])

sales_data.head()
# ##################################################################################

# ##################################################################################
# Training
# ##################################################################################
# select columns other than 'Opportunity Number','Opportunity Result'

cols = [col for col in sales_data.columns if col not in ['Opportunity Number','Opportunity Result']]

# dropping the 'Opportunity Number'and 'Opportunity Result' columns
data = sales_data[cols]

#assigning the Oppurtunity Result column as target
target = sales_data['Opportunity Result']
ans = data.head(n=2)

#import the necessary module
from sklearn.model_selection import train_test_split

#split data set into train and test 
# 70% of the data is for traiing
# 30% for testing 
data_train, data_test, target_train, target_test = train_test_split(data,target, test_size = 0.30, random_state = 10)
# ##################################################################################

# ##################################################################################
# Apply Gaussian Naive Bayes 
# ##################################################################################
# import the necessary module
from sklearn.naive_bayes import GaussianNB
from sklearn.metrics import accuracy_score
#create an object of the type GaussianNB
gnb = GaussianNB()
#train the algorithm on training data and predict using the testing data
pred = gnb.fit(data_train, target_train).predict(data_test)

#print(pred.tolist())
#print the accuracy score of the model
print("Naive-Bayes accuracy : ",accuracy_score(target_test, pred, normalize = True))
# ##################################################################################


# ##################################################################################
# Aplying LinearSVC
# ##################################################################################
#import the necessary modules
from sklearn.svm import LinearSVC
from sklearn.metrics import accuracy_score
#create an object of type LinearSVC
svc_model = LinearSVC(random_state=0)
#train the algorithm on training data and predict using the testing data
pred = svc_model.fit(data_train, target_train).predict(data_test)
#print the accuracy score of the model
print("LinearSVC accuracy : ",accuracy_score(target_test, pred, normalize = True))
# ##################################################################################


# ##################################################################################
# GaussianNB
# ##################################################################################
from yellowbrick.classifier import ClassificationReport
# Instantiate the classification model and visualizer
visualizer = ClassificationReport(gnb, classes=['Won','Loss'])
visualizer.fit(data_train, target_train) # Fit the training data to the visualizer
visualizer.score(data_test, target_test) # Evaluate the model on the test data
g = visualizer.poof() # Draw/show/poof the data
# ##################################################################################
