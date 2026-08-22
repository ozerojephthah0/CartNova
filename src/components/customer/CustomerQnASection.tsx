import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  HelpCircle,
  MessageSquare,
  ThumbsUp,
  Search,
  CheckCircle2,
  Send,
  User,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';
import { ProductQuestion } from '../../types';

interface CustomerQnASectionProps {
  productId: string;
}

export const CustomerQnASection: React.FC<CustomerQnASectionProps> = ({ productId }) => {
  const {
    productQuestions,
    askProductQuestion,
    answerProductQuestion,
    voteHelpfulAnswer,
    currentUser,
    isLoggedIn,
    openAuthModal,
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [newQuestionText, setNewQuestionText] = useState('');
  const [replyingToQId, setReplyingToQId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const questionsForProduct = productQuestions.filter(
    (q) => q.productId === productId || q.productId === 'prod-1' // fallback for demo
  );

  const filteredQuestions = questionsForProduct.filter(
    (q) =>
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.answers.some((a) => a.answer.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleAsk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      openAuthModal('login');
      return;
    }
    if (!newQuestionText.trim()) return;
    askProductQuestion(productId, newQuestionText);
    setNewQuestionText('');
  };

  const handleAnswer = (questionId: string) => {
    if (!isLoggedIn) {
      openAuthModal('login');
      return;
    }
    if (!replyText.trim()) return;
    answerProductQuestion(questionId, replyText);
    setReplyText('');
    setReplyingToQId(null);
  };

  return (
    <div className="space-y-6 pt-6 border-t border-slate-200 dark:border-slate-800">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-orange-500" />
            Customer Questions & Answers ({filteredQuestions.length})
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Have a question? Search answers from verified buyers and official sellers.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Have a question? Search answers..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
          />
        </div>
      </div>

      {/* Ask Question Box */}
      <form onSubmit={handleAsk} className="flex gap-2">
        <input
          type="text"
          value={newQuestionText}
          onChange={(e) => setNewQuestionText(e.target.value)}
          placeholder="Ask the community or seller a question about this product..."
          className="flex-1 px-4 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
        <button
          type="submit"
          className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Ask Question</span>
        </button>
      </form>

      {/* Questions List */}
      <div className="space-y-4">
        {filteredQuestions.length === 0 ? (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-xs">
            No questions found matching your search. Be the first to ask!
          </div>
        ) : (
          filteredQuestions.map((q) => (
            <div
              key={q.id}
              className="p-4 rounded-2xl bg-white dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-3"
            >
              {/* Question */}
              <div className="flex items-start gap-2.5">
                <span className="font-extrabold text-xs text-orange-600 bg-orange-50 dark:bg-orange-950/40 px-2 py-0.5 rounded-md shrink-0">
                  Question:
                </span>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">{q.question}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Asked by {q.askedBy} • {q.date}
                  </p>
                </div>
              </div>

              {/* Answers */}
              <div className="space-y-2 pl-4 border-l-2 border-slate-200 dark:border-slate-700 ml-3">
                {q.answers.map((ans) => (
                  <div key={ans.id} className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded text-[10px]">
                        Answer:
                      </span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{ans.answeredBy}</span>
                      {ans.isSeller && (
                        <span className="inline-flex items-center gap-1 text-[10px] bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-bold px-1.5 py-0.5 rounded">
                          <ShieldCheck className="w-3 h-3" /> Official Seller
                        </span>
                      )}
                      {ans.isVerifiedBuyer && (
                        <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-bold px-1.5 py-0.5 rounded">
                          <CheckCircle2 className="w-3 h-3" /> Verified Buyer
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400">• {ans.date}</span>
                    </div>

                    <p className="text-slate-700 dark:text-slate-300 pl-2 leading-relaxed">{ans.answer}</p>

                    <div className="flex items-center gap-2 pl-2 pt-1">
                      <button
                        onClick={() => voteHelpfulAnswer(q.id, ans.id)}
                        className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-orange-600 font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700/60 hover:bg-orange-50 transition-colors cursor-pointer"
                      >
                        <ThumbsUp className="w-3 h-3" />
                        <span>Helpful ({ans.helpfulVotes})</span>
                      </button>
                    </div>
                  </div>
                ))}

                {/* Reply action */}
                {replyingToQId === q.id ? (
                  <div className="pt-2 flex gap-2">
                    <input
                      type="text"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Write your answer..."
                      className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white"
                      autoFocus
                    />
                    <button
                      onClick={() => handleAnswer(q.id)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl"
                    >
                      Post Answer
                    </button>
                    <button
                      onClick={() => setReplyingToQId(null)}
                      className="px-2 py-1.5 text-xs text-slate-500 hover:text-slate-700"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setReplyingToQId(q.id)}
                    className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline pt-1 block cursor-pointer"
                  >
                    + Answer this question
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
