import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, Loader2, Target, ArrowRight, Upload, FileText, Video, File, XCircle } from "lucide-react";
import { Chapter, Question } from "@/utils/studentChapter.service";
import { toast } from "sonner";
import api from '@/lib/api';

interface QuizAndSubmissionProps {
  chapter: Chapter;
  selectedAnswers: Record<number, string>;
  submitted: boolean;
  currentScore: number;
  hasNextChapter?: boolean; // Made optional with default
  onAnswerChange: (questionIndex: number, answer: string) => void;
  onSubmitSuccess: (result: any) => void;
  onRetake: () => void;
  onNextChapter: () => void;
  calculateQuizScore: () => number;
}

type SubmissionType = 'text' | 'video' | 'pdf';

export default function QuizAndSubmission({
  chapter,
  selectedAnswers,
  submitted,
  currentScore,
  hasNextChapter = false, // Default value
  onAnswerChange,
  onSubmitSuccess,
  onRetake,
  onNextChapter,
  calculateQuizScore,
}: QuizAndSubmissionProps) {
  const [submissionType, setSubmissionType] = useState<SubmissionType>('text');
  const [textContent, setTextContent] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const allAnswered = chapter.questions?.every(
    (_, i) => selectedAnswers[i] !== undefined
  );

  const validateFile = (file: File, type: SubmissionType): string | null => {
    const maxSize = 25 * 1024 * 1024;
    
    if (file.size > maxSize) {
      return 'File size must be less than 25MB';
    }

    if (type === 'video') {
      const validTypes = ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/webm', 'video/x-msvideo'];
      if (!validTypes.includes(file.type)) {
        return 'Only MP4, MPEG, MOV, WebM, and AVI videos are allowed';
      }
    } else if (type === 'pdf') {
      if (file.type !== 'application/pdf') {
        return 'Only PDF files are allowed';
      }
    }

    return null;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validationError = validateFile(file, submissionType);
    if (validationError) {
      setError(validationError);
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }

    setSelectedFile(file);
    setError(null);

    if (submissionType === 'video') {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else if (submissionType === 'pdf') {
      setPreviewUrl(file.name);
    }
  };

  const handleTypeChange = (type: SubmissionType): void => {
    if (previewUrl && submissionType === 'video') {
      URL.revokeObjectURL(previewUrl);
    }
    setSubmissionType(type);
    setSelectedFile(null);
    setPreviewUrl(null);
    setTextContent('');
    setError(null);
  };

  const handleSubmit = async (): Promise<void> => {
    if (!allAnswered) {
      const unansweredCount = chapter.questions.filter((_, i) => !selectedAnswers[i]).length;
      setError(`Please answer all questions before submitting. ${unansweredCount} question(s) remaining.`);
      return;
    }

    if (submissionType === 'text' && !textContent.trim()) {
      setError('Please provide text content for your submission');
      return;
    }

    if ((submissionType === 'video' || submissionType === 'pdf') && !selectedFile) {
      setError(`Please select a ${submissionType} file`);
      return;
    }

    if (submissionType === 'text' && textContent.trim().length < 10) {
      setError('Text submission must be at least 10 characters');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const score = calculateQuizScore();
      
      const answers = chapter.questions.map((q, i) => ({
        questionText: q.questionText,
        selectedAnswer: selectedAnswers[i] || "",
      }));

      const formData = new FormData();
      
      // Send answers as JSON string - the backend will parse it
      formData.append('answers', JSON.stringify(answers));
      formData.append('submissionType', submissionType);

      if (submissionType === 'text') {
        formData.append('submissionContent', textContent);
      } else if (selectedFile) {
        formData.append('submissionFile', selectedFile);
      }

      const { data } = await api.post(
        `/chapters/${chapter.gradeId._id}/chapters/${chapter._id}/submit`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (data.success) {
        if (previewUrl && submissionType === 'video') {
          URL.revokeObjectURL(previewUrl);
        }
        onSubmitSuccess({ score });
        toast.success(`Chapter submitted successfully! Your score: ${score}%`, {
          duration: 5000,
        });
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to submit chapter';
      setError(errorMessage);
      console.error('Submission error:', err.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    return () => {
      if (previewUrl && submissionType === 'video') {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl, submissionType]);

  return (
    <Card className="border-0 shadow-lg rounded-2xl overflow-hidden bg-white/70 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-100 p-4 sm:p-6">
        <CardTitle className="text-lg sm:text-xl md:text-2xl flex items-center gap-2 sm:gap-3 text-gray-800">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0">
            <Target className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <span>Quiz & Submission</span>
        </CardTitle>
        <CardDescription className="text-gray-600 text-sm sm:text-base">
          Answer all questions and provide your submission to complete this chapter.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8">
        {/* Quiz Questions */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-800">Quiz Questions</h3>
          {chapter.questions.map((q: Question, index: number) => (
            <div key={index} className="space-y-3 sm:space-y-4">
              <p className="font-semibold text-base sm:text-lg text-gray-800">
                Q{index + 1}: {q.questionText}
              </p>
              <RadioGroup
                value={selectedAnswers[index] || ""}
                onValueChange={(val) => onAnswerChange(index, val)}
                className="space-y-2 sm:space-y-3"
              >
                {q.options.map((opt: string, optIndex: number) => {
                  const optionLabel = String.fromCharCode(65 + optIndex);
                  const isSelected = selectedAnswers[index] === opt;
                  const isCorrectOption = opt === q.correctAnswer;
                  
                  let optionClasses =
                    "flex items-center gap-2 sm:gap-3 border-2 p-3 sm:p-4 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md";
                  
                  if (submitted) {
                    if (isCorrectOption) {
                      optionClasses += " border-green-400 bg-green-50 shadow-green-100";
                    } else if (isSelected && !isCorrectOption) {
                      optionClasses += " border-red-400 bg-red-50 shadow-red-100";
                    } else {
                      optionClasses += " border-gray-200 bg-gray-50";
                    }
                  } else {
                    if (isSelected) {
                      optionClasses += " border-purple-400 bg-purple-50 shadow-purple-100";
                    } else {
                      optionClasses += " border-gray-200 bg-white hover:border-purple-300";
                    }
                  }
                  
                  const optionId = `question-${index}-option-${optionLabel}`;
                  
                  return (
                    <div key={opt} className={optionClasses}>
                      <RadioGroupItem
                        value={opt}
                        id={optionId}
                        disabled={submitted}
                        className="text-purple-600 flex-shrink-0"
                      />
                      <label
                        htmlFor={optionId}
                        className="text-gray-700 font-medium w-full cursor-pointer text-sm sm:text-base"
                      >
                        <span className="font-bold text-purple-600 mr-2">
                          {optionLabel}.
                        </span>
                        {opt}
                      </label>
                    </div>
                  );
                })}
              </RadioGroup>
            </div>
          ))}
        </div>

        {/* Submission Section - Only show if not submitted */}
        {!submitted && (
          <div className="space-y-6 border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-800">Your Submission</h3>
            
            <div className="space-y-3">
              <label className="text-sm font-medium">Submission Type</label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => handleTypeChange('text')}
                  disabled={loading}
                  className={`p-4 border rounded-lg flex flex-col items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                    submissionType === 'text'
                      ? 'border-purple-600 bg-purple-50 text-purple-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <FileText className="h-6 w-6" />
                  <span className="text-sm font-medium">Text</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => handleTypeChange('video')}
                  disabled={loading}
                  className={`p-4 border rounded-lg flex flex-col items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                    submissionType === 'video'
                      ? 'border-purple-600 bg-purple-50 text-purple-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Video className="h-6 w-6" />
                  <span className="text-sm font-medium">Video</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => handleTypeChange('pdf')}
                  disabled={loading}
                  className={`p-4 border rounded-lg flex flex-col items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                    submissionType === 'pdf'
                      ? 'border-purple-600 bg-purple-50 text-purple-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <File className="h-6 w-6" />
                  <span className="text-sm font-medium">PDF</span>
                </button>
              </div>
            </div>

            {submissionType === 'text' && (
              <div className="space-y-2">
                <label htmlFor="textContent" className="text-sm font-medium">
                  Your Response
                </label>
                <Textarea
                  id="textContent"
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  placeholder="Write your response here... (minimum 50 characters)"
                  rows={8}
                  className="w-full"
                  disabled={loading}
                />
                <p className="text-xs text-gray-500">
                  {textContent.length} / 50 characters minimum
                </p>
              </div>
            )}

            {(submissionType === 'video' || submissionType === 'pdf') && (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors">
                  <input
                    type="file"
                    id="fileInput"
                    accept={submissionType === 'video' ? 'video/*' : 'application/pdf'}
                    onChange={handleFileSelect}
                    disabled={loading}
                    className="hidden"
                  />
                  <label
                    htmlFor="fileInput"
                    className={`cursor-pointer flex flex-col items-center gap-3 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <Upload className="h-12 w-12 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Click to upload {submissionType}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {submissionType === 'video'
                          ? 'MP4, MPEG, MOV, WebM, AVI (Max 100MB)'
                          : 'PDF only (Max 100MB)'}
                      </p>
                    </div>
                  </label>
                </div>

                {selectedFile && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      {submissionType === 'video' ? (
                        <Video className="h-5 w-5 text-purple-600 mt-0.5" />
                      ) : (
                        <File className="h-5 w-5 text-purple-600 mt-0.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {selectedFile.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (previewUrl && submissionType === 'video') {
                            URL.revokeObjectURL(previewUrl);
                          }
                          setSelectedFile(null);
                          setPreviewUrl(null);
                        }}
                        disabled={loading}
                        className="text-red-600 hover:text-red-700 disabled:opacity-50"
                      >
                        <XCircle className="h-5 w-5" />
                      </button>
                    </div>

                    {submissionType === 'video' && previewUrl && (
                      <video
                        src={previewUrl}
                        controls
                        className="w-full mt-4 rounded-lg"
                        style={{ maxHeight: '300px' }}
                      />
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!submitted ? (
          <Button
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium px-6 sm:px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            disabled={loading}
            onClick={handleSubmit}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin mr-2" />
            ) : (
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            )}
            <span className="text-sm sm:text-base">Submit Chapter</span>
          </Button>
        ) : (
          <div className="flex flex-col gap-4 sm:gap-6 mt-4 sm:mt-6">
            {/* Score Display */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border-2 border-indigo-200">
              <div className="flex flex-col items-center gap-4">
                <h3 className="text-lg font-semibold text-gray-800">Your Results</h3>
                <div
                  className={`px-6 sm:px-8 py-3 sm:py-4 rounded-xl border-2 text-xl sm:text-2xl font-bold shadow-lg ${
                    currentScore >= 70
                      ? "bg-green-50 border-green-400 text-green-800 shadow-green-100"
                      : currentScore >= 50
                      ? "bg-yellow-50 border-yellow-400 text-yellow-800 shadow-yellow-100"
                      : "bg-red-50 border-red-400 text-red-800 shadow-red-100"
                  }`}
                >
                  Score: {currentScore}%
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    You answered{" "}
                    <span className="font-semibold text-gray-800">
                      {Math.round((currentScore / 100) * chapter.questions.length)}
                    </span>{" "}
                    out of{" "}
                    <span className="font-semibold text-gray-800">
                      {chapter.questions.length}
                    </span>{" "}
                    questions correctly
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Button
                variant="outline"
                onClick={onRetake}
                className="w-full sm:w-auto bg-white border-2 border-gray-300 hover:border-purple-400 hover:bg-purple-50 text-gray-700 font-medium px-4 sm:px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
              >
                <span className="text-sm sm:text-base">Retake Quiz</span>
              </Button>
              {chapter.isCompleted && (
                <Button
                  onClick={onNextChapter}
                  className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-medium px-4 sm:px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  <span className="text-sm sm:text-base">
                    {hasNextChapter ? "Next Chapter" : "View All Chapters"}
                  </span>
                  <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
              )}
               <Button
                variant="outline"
                onClick={()=>{ window.location.href=`/dashboard/student/assignments`}}
                className="w-full sm:w-auto bg-white border-2 border-gray-300 hover:border-purple-400 hover:bg-purple-50 text-gray-700 font-medium px-4 sm:px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
              >
                <span className="text-sm sm:text-base">Assignments</span>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}