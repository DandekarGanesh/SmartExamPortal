import mongoose from "mongoose";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/AsyncHandler.js";
import { Exam } from './../../models/exam.model.js';
import { StudentAnswers } from "../../models/student.answers.model.js";
import { Question } from './../../models/question.model.js';
import { emptyFieldValidator } from "../../helper/emptyFieldValidator.js";
import { StudentResult } from "../../models/student.result.model.js";



const getMyExams = asyncHandler(async (req, res, next) => {

    try {
        const { _id } = req.student;

        const exams = await Exam.find({
            students: new mongoose.Types.ObjectId(_id),
        })

        console.log("id :",_id);
        console.log("exams :",exams);

        return res
        .status(200)
        .json(      
            new ApiResponse(
                200, 
                "Exams retrieved successfully", 
                {
                    exams
                }
            )
        );
        
    } 
    catch (error) {
        throw new ApiError(500, error.message);
    }
    
})


const getExamDetails = asyncHandler(async (req, res, next) => {

    try {
        const { examId } = req.params;
        const { _id } = req.student;

        console.log("examId :",examId);
        console.log("_id :",_id);
        
        const exam = await Exam.aggregate([
            {
                $match: {
                    $and: [
                        {
                            _id: new mongoose.Types.ObjectId(examId),
                        },
                        {
                            students: new mongoose.Types.ObjectId(_id),
                        }
                    ]
                }
            },


            {
                $lookup: {
                    from: "questions",
                    localField: "_id",
                    foreignField: "exam",
                    as: "questions",
                }
            },

            {
                $addFields: {
                    questions: "$questions"
                }
            },

            {
                $project: {

                    examName: 1,
                    examCode: 1,
                    examDate: 1,
                    examTime: 1,
                    examDuration: 1,
                    duration: 1,
                    startDate: 1,
                    endDate: 1,
                    questions: 1,
                    createdBy: 1,
                    createdAt: 1,
                    updatedBy: 1,
                    updatedAt: 1,
                }
            }
        ])

        const student = await Student.findById(_id);
        student.exams.push(examId);
        await student.save();
        
        const result = await StudentResult.create({
            student: _id, 
            exam: examId,
            examStatus: "pending",
            examScore: 0,
            examMarks: 0,

        })
    
        return res
        .status(200)
        .json(      
            new ApiResponse(
                200, 
                "Exam details retrieved successfully", 
                {
                    exam
                }
            )
        );
        
    } 
    catch (error) {
        throw new ApiError(500, error.message);
    }

})


const submitAnswer = asyncHandler(async (req, res, next) => {
    try {

        const { examId } = req.params;
        const {_id} = req.student;

        const { 
            questionId,
            answerText,
            answerDuration,
            answerMarks,
        } = req.body;


        emptyFieldValidator(answerText, answerDuration, answerMarks);

        const question = await Question.findOne({
            _id: new mongoose.Types.ObjectId(questionId),
            exam: new mongoose.Types.ObjectId(examId),
        })


        if(!question) {
            throw new ApiError(400, "Question not found");
        }




        const existedAnswer = await StudentAnswers.findOne({
            student: new mongoose.Types.ObjectId(_id),
            exam: new mongoose.Types.ObjectId(examId),
            question: new mongoose.Types.ObjectId(question._id),
        })


        if(existedAnswer) {


            if(question.questionAnswer === answerText) {
                existedAnswer.isCorrect = true;
                existedAnswer.isAnswered = isAnswered;
            }

            existedAnswer.answerText = answerText;
            existedAnswer.answerDuration = answerDuration;
            await existedAnswer.save();

            return res
            .status(200)
            .json(
                new ApiResponse(
                    200, 
                    "Question updated successfully", 
                    {
                        answer: existedAnswer
                    }
                )
            )
        }


        let isCorrect = false;
        let answerScore = 0;

        if(question.questionAnswer === answerText) {
            isCorrect = true;
            answerScore = question.questionMarks;
        }

        const answer = await StudentAnswers.create({

            student: new mongoose.Types.ObjectId(_id),
            exam: new mongoose.Types.ObjectId(examId),
            question: new mongoose.Types.ObjectId(question._id),

            answerText: answerText,
            answerDuration: answerDuration,
            answerMarks: answerScore,
            isCorrect: isCorrect,
            isAnswered: true,
            answerTime: 0,

        })
        
        return res
        .status(200)
        .json(
            new ApiResponse(
                200, 
                "Question created successfully", 
                {
                    answer
                }
            )
        )
        
    } 
    catch (error) {
        throw new ApiError(500, error.message)
    }
})


const submitExam = asyncHandler(async (req, res, next) => {
    try {

        const { examId } = req.params;
        const {_id} = req.student;


        

        const questionAnswers = await StudentAnswers.aggregate([

            /** Match the Fields **/
            {
                $match: {
                    $and: [
                        {
                            student: new mongoose.Types.ObjectId(_id),
                        },
                        {
                            exam: new mongoose.Types.ObjectId(examId),
                        }
                    ]
                }
            },

            
        ])

    
        let totalMarks = 0;
        questionAnswers.map(doc => totalMarks += doc.answerMarks);

        console.log("totalMarks => ", totalMarks);

        const existedExam = await StudentResult.find({
            student: new mongoose.Types.ObjectId(_id),
            exam: new mongoose.Types.ObjectId(examId),
        })

        if(existedExam) {


            existedExam.examStatus = "passed";
            existedExam.examScore = totalMarks;
            existedExam.examMarks = totalMarks;
            existedExam.totalQuestionsSolved = questionAnswers.length;
            await existedExam.save();

            return res
            .status(200)
            .json(
                new ApiResponse(
                    200, 
                    "Exam submitted successfully", 
                    {
                        answers : existedExam
                    }
                )
            )
        }


        const answers = await StudentExam.create({
            student: new mongoose.Types.ObjectId(_id),
            exam: new mongoose.Types.ObjectId(examId),
            examStatus: "pending",
            examScore: totalMarks,
            examDurationByStudent: 1,
            totalQuestionsSolved : questionAnswers.length
            
        })
        
        return res
        .status(200)
        .json(
            new ApiResponse(
                200, 
                "Exam submitted successfully", 
                {
                    answers
                }
            )
        )
            
    } 
    catch (error) {
        throw new ApiError(500, error.message)
    }
})


const attemptedExam = asyncHandler(async (req, res, next) => {

    try {
        
        const { _id } = req.student;

        const exams = await StudentAnswers.aggregate([
            {
                $match: {
                    $and: [
                        {
                            student: new mongoose.Types.ObjectId(_id),
                        },
                    ]
                }
            }
        ])

        return res
        .status(200)
        .json(      
            new ApiResponse(
                200, 
                "Exams attempted successfully", 
                {
                    exams
                }
            )
        );
        
    } 
    catch (error) {
        throw new ApiError(500, error.message);
    }

})    


const viewExamResult = asyncHandler(async (req, res, next) => {
    try {

        const { examId } = req.params;
        const {_id} = req.student;

        const answerSheet = await StudentExam.aggregate([
            {
                $match: {
                    $and: [
                        {
                            student: new mongoose.Types.ObjectId(_id),
                        },
                        {
                            exam: new mongoose.Types.ObjectId(examId),
                        },
                    ]
                }
            },
            {
                $lookup: {
                    from: "questions",
                    localField: "exam",
                    foreignField: "exam",
                    as: "questions",

                    pipeline: [
                        {
                            $match: {
                                $and: [
                                    {
                                        "$questions.questionAnswer": "answer"
                                    }
                                ]
                            }
                        }
                    ]
                }
            },
        ])



        return res
        .status(200)
        .json(      
        new ApiResponse(
            200, 
            "Exam result viewed successfully", 
            {
                answerSheet
            }
        )
        );
    } 
    catch (error) {
        throw new ApiError(500, error.message);
    }
});

const getStudentDashboard = asyncHandler(async (req, res, next) => {

    try {
        const { _id } = req.student;

        const dashboard = await Exam.aggregate([
            {
                $match: {
                    $and: [
                        {
                            student: new mongoose.Types.ObjectId(_id),
                        },
                    ]
                }
            },
            {
                $lookup: {
                    from: "answers",
                    localField: "_id",
                    foreignField: "exam",
                    as: "answers",

                    pipeline: [
                        {
                            $match: {
                                $and: [
                                    {
                                        "$answers.student": new mongoose.Types.ObjectId(_id),
                                    }
                                ]
                            }
                        },
                        {
                            $project: {
                                answers: 1,
                            }
                        }
                    ]
                }
            },
            {
                $project: {
                    exam: 1,
                    answers: 1,
                }
            }
        ])

        return res
        .status(200)
        .json(      
            new ApiResponse(
                200, 
                "Student dashboard retrieved successfully", 
                {
                    dashboard
                }
            )
        );
    } 
    catch (error) {
        throw new ApiError(500, error.message);
    }

})

const getExamResult = asyncHandler(async (req, res, next) => {
    try {

        const { examId } = req.params;
        const {_id} = req.student;

        const answerSheet = await StudentExam.aggregate([
            {
                $match: {
                    $and: [
                        {
                            student: new mongoose.Types.ObjectId(_id),
                        },
                        {
                            exam: new mongoose.Types.ObjectId(examId),
                        },
                    ]
                }
            },
            {
                $lookup: {
                    from: "studentanswers",
                    localField: "exam",
                    foreignField: "exam",
                    as: "studentanswers",
                }
            },

            {
                $lookup: {
                    from: "questions",
                    localField: "exam",
                    foreignField: "exam",
                    as: "questions",
                }
            },

            {
                $addFields: {
                    questions: "$questions",
                    studentanswers: "$studentanswers"
                }
            },


            {
                $project: {
                    _id: 1,
                    student: 1,
                    exam: 1,

                    answers: 1,
                    totalQuestionsSolved: 1,
                    examStatus: 1,
                    examScore: 1,
                    examDurationByStudent: 1,


                    questions: 1,
                    studentanswers: 1,

                }
            }
        ])

        return res
        .status(200)
        .json(      
            new ApiResponse(
                200, 
                "Exam result viewed successfully", 
                {
                    answerSheet
                }
            )
        );
    } 
    catch (error) {
        throw new ApiError(500, error.message);
    }
}); 


export {
    getMyExams,
    submitExam,
    viewExamResult,
    getExamDetails,
    submitAnswer,
    getExamResult,
    attemptedExam
};