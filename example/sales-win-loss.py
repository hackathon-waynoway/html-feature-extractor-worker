# Examples From: https://www.dataquest.io/blog/sci-kit-learn-tutorial/
# Installing Requirements
# pip install seaborn
# pip install pandas
# pip install matplotlib

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
encoded_value = le.fit_transform(["paris", "paris", "tokyo", "amsterdam"])
print(encoded_value)
# ##################################################################################
