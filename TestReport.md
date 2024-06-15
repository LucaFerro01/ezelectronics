# Test Report

<The goal of this document is to explain how the application was tested, detailing how the test cases were defined and what they cover>

# Contents

- [Test Report](#test-report)
- [Contents](#contents)
- [Dependency graph](#dependency-graph)
- [Unit approach](#Unit-approach)
- [Tests](#tests)
    -[Review Controller Unit Tests](#review-controller-unit-tests)
    -[Review DAO Unit Tests](#review-dao-unit-tests)
    -[Review Routes Unit Tests](#review-routes-unit-tests)
    -[Review Unit
   Unit Tests](#review-Unit
  -tests)
- [Coverage](#coverage)
  - [Coverage of FR](#coverage-of-fr)
  - [Coverage white box](#coverage-white-box)

# Dependency graph

     <report the here the dependency graph of EzElectronics>

# Unit approach

    <Write here the Unit
   sequence you adopted, in general terms (top down, bottom up, mixed) and as sequence

    (ex: step1: unit A, step 2: unit A+B, step 3: unit A+B+C, etc)>

    <Some steps may  correspond to unit testing (ex step1 in ex above)>

    <One step will  correspond to API testing, or testing unit route.js>

# Tests

<in the table below list the test cases defined For each test report the object tested, the test level (API, Unit, unit) and the technique used to define the test case (BB/ eq partitioning, BB/ boundary, WB/ statement coverage, etc)> <split the table if needed>

### Review Controller Unit Tests
| Test case name | Object(s) tested | Test level | Technique used |
| :------------: | :--------------: | :--------: | :------------: |       
| addReview should call newReview on DAO   | ReviewController| Unit         | WB/ statement coverage    |
| getProductReviews should call returnReviews on DAO | ReviewController| Unit         | WB/ statement coverage    |
| deleteReview should call deleteReview on DAO | ReviewController| Unit         | WB/ statement coverage    |
| deleteReviewsOfProduct should call deleteAllReviewsProduct on DAO | ReviewController| Unit   | WB/ statement coverage    |
| deleteAllReviews should call deleteAllReviews on DAO | ReviewController| Unit      | WB/ statement coverage    |


### Review DAO Unit Tests
| Test case name | Object(s) tested | Test level | Technique used |
| :------------: | :--------------: | :--------: | :------------: |
| newReview should add a review to the database | ReviewDAO         | Unit  | WB/ statement coverage    |
| newReview should reject with an error if the product does not exist | ReviewDAO  | Unit  | WB/ statement coverage    |
| newReview should reject with an error if the user has already reviewed the product | ReviewDAO | Unit  | WB/ statement coverage    |
| newReview should reject with an error if there is an error checking the product | ReviewDAO  | Unit  | WB/ statement coverage    |
| newReview should reject with an error if there is an error checking existing reviews | ReviewDAO| Unit  | WB/ statement coverage    |
| newReview should reject with an error if there is an error inserting the review | ReviewDAO | Unit  | WB/ statement coverage    |
| returnReviews should return all reviews for a product from the database | ReviewDAO  | Unit  | WB/ statement coverage    |
| returnReviews should reject with an error if the product does not exist | ReviewDAO | Unit  | WB/ statement coverage    |
| returnReviews should reject with an error if there is an error checking the product | ReviewDAO| Unit  | WB/ statement coverage    |
| returnReviews should reject with an error if there is an error fetching reviews | ReviewDAO| Unit  | WB/ statement coverage    |
| deleteReview should delete a review from the database | ReviewDAO    | Unit  | WB/ statement coverage    |
| deleteReview should reject with an error if the product does not exist | ReviewDAO | Unit  | WB/ statement coverage    |
| deleteReview should reject with an error if the user has not reviewed the product | ReviewDAO| Unit  | WB/ statement coverage    |
| deleteReview should reject with an error if there is an error checking the product | ReviewDAO | Unit  | WB/ statement coverage    |
| deleteReview should reject with an error if there is an error checking the review | ReviewDAO | Unit  | WB/ statement coverage    |
| deleteReview should reject with an error if there is an error deleting the review | ReviewDAO| Unit  | WB/ statement coverage    |
| deleteAllReviewsProduct should delete all reviews for a product from the database | ReviewDAO | Unit  | WB/ statement coverage    |
| deleteAllReviewsProduct should reject with an error if the product does not exist | ReviewDAO | Unit  | WB/ statement coverage    |
| deleteAllReviewsProduct should reject with an error if there is an error checking the product | ReviewDAO | Unit  | WB/ statement coverage    |
| deleteAllReviewsProduct should reject with an error if there is an error deleting reviews | ReviewDAO | Unit  | WB/ statement coverage    |
| deleteAllReviews should delete all reviews from the database | ReviewDAO  | Unit  | WB/ statement coverage    |
| deleteAllReviews should reject with an error if there is an error deleting reviews | ReviewDAO | Unit  | WB/ statement coverage    |


### Review Routes Unit Tests
| Test Case Name                                        | Object(s) tested                               | Test Level | Technique Used              |
|-------------------------------------------------------|-------------------------------------------------|------------|-----------------------------|
| Review tests                                          | ReviewController                               | Unit | WB/ statement coverage       |
|   It should return a 200 success code if a review...  | addReview                                       | Unit | WB/ statement coverage       |
|   It should return a 422 error code if the score ...  | addReview                                       | Unit | WB/ statement coverage       |
|   It should return a 422 error code if the model...   | addReview                                       | Unit | WB/ statement coverage       |
|   It should return a 422 error code if the comme...   | addReview                                       | Unit | WB/ statement coverage       |
|   It should return a 401 error code if the user ...   | addReview                                       | Unit | WB/ statement coverage       |
|   It should return a 401 error code if the user ...   | addReview                                       | Unit | WB/ statement coverage       |
|   It should return a 200 success code if all rev...   | getProductReviews                               | Unit | WB/ statement coverage       |
|   It should return a 401 error code if the user ...   | getProductReviews                               | Unit | WB/ statement coverage       |
|   It should return a 200 success code if a revie...   | deleteReview                                    | Unit | WB/ statement coverage       |
|   It should return a 401 error code if the user ...   | deleteReview                                    | Unit | WB/ statement coverage       |
|   It should return a 401 error code if the user ...   | deleteReview                                    | Unit | WB/ statement coverage       |
|   It should return a 401 error code if the user ...   | deleteReview                                    | Unit | WB/ statement coverage       |
|   It should return a 200 success code if all rev...   | deleteReviewsOfProduct                          | Unit | WB/ statement coverage       |
|   It should return a 401 error code if the user ...   | deleteReviewsOfProduct                          | Unit | WB/ statement coverage       |
|   It should return a 401 error code if the user ...   | deleteReviewsOfProduct                          | Unit | WB/ statement coverage       |
|   It should return a 200 success code if all rev...   | deleteAllReviews                                | Unit | WB/ statement coverage       |
|   It should return a 401 error code if the user ...   | deleteAllReviews                                | Unit | WB/ statement coverage       |
|   It should return a 401 error code if the user ...   | deleteAllReviews                                | Unit | WB/ statement coverage       |

### Review Integration Tests
| Test Case Name                   | Object(s) tested      | Test Level        | Technique Used       |
|----------------------------------|-----------------------|-------------------|----------------------|
| add Review - OK                  | Review routes         | Integration      | BB/ eq partitioning  |
| add review - already existing review (409) | Review routes         | Integration     | BB/ boundary   |
| add review - insert an error of score (422) | Review routes         | Integration     | BB/ boundary   |
| get reviews - OK                 | Review routes         | Integration      | BB/ eq partitioning   |
| delete review - OK               | Review routes         | Integration     | Black Box Testing    |
| delete review - review not found (404) | Review routes         | Integration      | BB/ boundary   |
| delete review - unauthorized (401) | Review routes         | Integration   | BB/ boundary   |
| delete all reviews for a product - OK | Review routes         | Integration      | BB/ eq partitioning    |
| delete all reviews for a product - unauthorized (401) | Review routes         | Integration     | BB/ boundary   |
| delete all reviews - ok           | Review routes         | Integration      | BB/ boundary   |

# Coverage

## Coverage of FR

<Report in the following table the coverage of functional requirements and scenarios(from official requirements) >

| Functional Requirement or scenario | Test(s) |
| :--------------------------------: | :-----: |
|                FRx                 |         |
|                FRy                 |         |
|                ...                 |         |

## Coverage white box

Report here the screenshot of coverage values obtained with jest-- coverage
