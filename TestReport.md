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
    -[Review Integration Tests](#review-integration-tests)
- [Coverage](#coverage)
  - [Coverage of FR](#coverage-of-fr)
  - [Coverage white box](#coverage-white-box)

# Dependency graph

  ![alt text](image.png)

# Unit approach

    <Write here the Unit sequence you adopted, in general terms (top down, bottom up, mixed) and as sequence

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
|   It should return a 200 success code if a review to a product is added  | addReview                                       | Unit | WB/ statement coverage       |
|   It should return a 422 error code if the score is not between 1 and 5  | addReview                                       | Unit | WB/ statement coverage       |
|   It should return a 422 error code if the model is an empty string   | addReview                                       | Unit | WB/ statement coverage       |
|   It should return a 422 error code if the comment is an empty string   | addReview                                       | Unit | WB/ statement coverage       |
|   It should return a 401 error code if the user is authenticated as manager   | addReview                                       | Unit | WB/ statement coverage       |
|   It should return a 401 error code if the user is authenticated as admin   | addReview                                       | Unit | WB/ statement coverage       |
|   It should return a 200 success code if all reviews of a product are returned   | getProductReviews                               | Unit | WB/ statement coverage       |
|   It should return a 401 error code if the user is not authenticated   | getProductReviews                               | Unit | WB/ statement coverage       |
|   It should return a 200 success code if a review is deleted   | deleteReview                                    | Unit | WB/ statement coverage       |
|   It should return a 401 error code if the user is not authenticated  | deleteReview                                    | Unit | WB/ statement coverage       |
|   It should return a 401 error code if the user is authenticated as admin  | deleteReview                                    | Unit | WB/ statement coverage       |
|   It should return a 401 error code if the user is authenticated as manager  | deleteReview                                    | Unit | WB/ statement coverage       |
|   It should return a 200 success code if all reviews of a product are deleted   | deleteReviewsOfProduct                          | Unit | WB/ statement coverage       |
|   It should return a 401 error code if the user is not authenticated  | deleteReviewsOfProduct                          | Unit | WB/ statement coverage       |
|   It should return a 401 error code if the user is authenticated as customer   | deleteReviewsOfProduct                          | Unit | WB/ statement coverage       |
|   It should return a 200 success code if all reviews are deleted   | deleteAllReviews                                | Unit | WB/ statement coverage       |
|   It should return a 401 error code if the user is not authenticateed  | deleteAllReviews                                | Unit | WB/ statement coverage       |
|   It should return a 401 error code if the user is authenticated as customer  | deleteAllReviews                                | Unit | WB/ statement coverage       |

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
|                **Manage reviews**                |         
|  FR4.1  -      Add a new review to a product   | newReview - should add a review to the database<br>newReview should reject with an error if the product does not exist<br>newReview should reject with an error if the user has already reviewed the product<br>newReview should reject with an error if there is an error checking the product<br>newReview should reject with an error if there is an error checking existing reviews<br>newReview should reject with an error if there is an error inserting the review|
|  FR4.2  -   Get the list of all reviews assigned to a product | returnReviews should return all reviews for a product from the database<br>returnReviews should reject with an error if the product does not exist<br>returnReviews should reject with an error if there is an error checking the product<br>returnReviews should reject with an error if there is an error fetching reviews |
|  FR4.3  -          Delete a review given to a product    | deleteReview should delete a review from the database<br>deleteReview should reject with an error if the product does not exist<br>deleteReview should reject with an error if the user has not reviewed the product<br>deleteReview should reject with an error if there is an error checking the product<br>deleteReview should reject with an error if there is an error checking the review<br>deleteReview should reject with an error if there is an error deleting the review|
|  FR4.4 -          Delete all reviews of a product    |deleteAllReviewsProduct should delete all reviews for a product from the database<br>deleteAllReviewsProduct should reject with an error if the product does not exist<br>deleteAllReviewsProduct should reject with an error if there is an error checking the product<br>deleteAllReviewsProduct should reject with an error if there is an error deleting reviews |
|  FR4.5 -       Delete all reviews of all products    | deleteAllReviews should delete all reviews from the database<br>deleteAllReviews should reject with an error if there is an error deleting reviews|
|                FRy                 |         |
|                ...                 |         |

## Coverage white box

Report here the screenshot of coverage values obtained with jest-- coverage
