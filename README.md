# ADE/NCES Scrape

## Purpose
This program is designed to scrape the relevant data such as testing scores, school performance, and demographical data from the Arkansas Department of Education and the NCES. This data is used to look at different schools and how each factor might affect testing scores and overall school performance.

## Data Points
### ADE
-----------------
* Distric Characteristics
    * Enrollment
    * Average Class Size
    * Average Years Teaching Experience
    * Per Pupil Spending
* Demographics
    * Student Race (Native American, Asian, African American, Hawaiian/Pacific Islander, Hispanic/Latino, White, Two or More Races)
    * Other
        * English Learners
        * Low Income
        * Students Eligible to Receive Special Education
* School Environment
    * Expulsions
    * Weapons Incidents
    * Staff Assaults
    * Student Assaults
    * Referrals to Law Enforcement
    * School-Related Arrests
* College Readiness
    * ACT
        * Reading
        * English
        * Math
        * Science
        * Composite
* School Performance
    * Attendance
    * Droupout Rate
    * Count of School Ratings (A-F)
* Teacher Quality
    * Certified
    * Bachelors
    * Masters
    * Advanced
### NCES
-----------------
* Community
    * Total Population
    * Median Household Income
    * Total Households
    * Race (White, Black, Hispanic, Asian, Native, Hawaiian, Other, Two or More Races)
    * Year House was Built
        * After 2000
        * Between 1970 and 1999
        * Before 1970
    * Housing Type
        * House
        * Other
    * Households with Broadband Internet 
* Children
    * Health
        * Children with Disability
        * Children with Health Insurance Coverage
    * Poverty and Benefits
        * Families with Income Below Poverty Level
        * Families with Food Stamp/SNAP benefits
    * Households by Type
        * Married-Couple
        * Female Householder, No Husband Present
        * Male Householder, No Wife Present
* Parents
    * Median Household Income
    * Housing Status
        * Rented
        * Owned
    * Employment Status
        * Employed
        * Unemployed




## Required Modules
* csv-parser
* puppeteer
* fs
* chalk

## Input Data
A list of ID's can be obtained from [here](https://adedata.arkansas.gov/nid/Home/District). The current filters are Agency Type is **Regular** and the OP Status is **Open**

## Output Data
Currently the data is output as a JSON file. It needs to be converted to CSV.