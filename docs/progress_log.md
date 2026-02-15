## Day 1 (Completed)
- Repository initialized and cleaned
- GitHub remote configured
- Initial documentation and structure completed
## Day 2 (Continued)
- Verified dataset structure and target variable
- Identified class imbalance in attrition
- Categorized numerical and categorical features
- Observed early relationship between overtime and attrition
## Day 3
- Conducted exploratory data analysis (EDA)
- Analyzed attrition distribution and class imbalance
- Identified key drivers: overtime, job satisfaction, income
- Derived business insights from visual patterns
## Day 4 (Continued)
- Interpreted feature correlation heatmap
- Identified strongly related and redundant features
- Shortlisted key drivers influencing attrition
## Day 5
- Cleaned dataset and removed irrelevant columns
- Encoded categorical variables using one-hot encoding
- Scaled numerical features
- Prepared model-ready train and test datasets
## Day 6
- Trained baseline Logistic Regression model
- Evaluated model using confusion matrix and classification report
- Identified recall as a key metric for attrition prediction
## Day 7 – Model Improvement & Evaluation
- Trained an improved Random Forest model for employee attrition prediction
- Applied class balancing to handle imbalanced attrition data
- Generated predictions on the test dataset
- Evaluated model performance using confusion matrix and classification report
- Achieved high overall accuracy but identified low recall for attrition cases
- Analyzed false negatives as a critical risk in HR decision-making
- Compared Random Forest performance with baseline Logistic Regression
- Identified recall improvement as the next key objective
## Day 8 – Explainable AI (SHAP)
- Implemented Explainable AI using SHAP for Random Forest model
- Handled SHAP compatibility and additivity issues for ensemble models
- Generated global explanations to identify key attrition drivers
- Created individual-level explanations for personalized risk analysis
- Improved transparency, trust, and interpretability of predictions
## Day 9 – Threshold Tuning & Recall Improvement
- Generated probability-based predictions using Random Forest
- Tuned classification threshold to improve attrition recall
- Reduced false negatives for high-risk employees
- Balanced precision–recall trade-off for HR decision-making
## Day 10 – Class Imbalance Handling (SMOTE)
- Applied SMOTE to balance attrition classes in training data
- Retrained Random Forest model on balanced dataset
- Evaluated performance improvements in recall
- Compared imbalance handling with threshold tuning
## Day 11 – Final Model Selection
- Compared baseline, threshold tuning, and SMOTE models
- Evaluated recall, precision, F1-score, and business impact
- Selected final production-ready model
- Justified decision based on HR risk reduction strategy
## Day 12 – FastAPI Deployment
- Exported final trained model using pickle
- Saved encoder and scaler for inference consistency
- Created backend folder structure
- Built FastAPI application with prediction endpoint
- Implemented Pydantic input validation schema
- Successfully tested `/predict` endpoint via Swagger UI
- Verified end-to-end prediction returning attrition probability
## Day 13 – Decision Layer Integration
- Integrated business threshold logic into backend
- Added risk categorization (High Risk / Low Risk)
- Returned decision threshold in API response
- Improved API interpretability for HR stakeholders
## Day 14 – Enterprise Backend Refinement
- Refactored backend into production-ready structure
- Moved model into dedicated models folder
- Added model version tracking
- Implemented health monitoring endpoint
- Integrated business decision logic layer
- Strengthened feature validation and error handling








 