'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import CountUp from 'react-countup';
import { 
  Zap, 
  Clock, 
  Trophy, 
  Code, 
  Server, 
  Activity,
  Rocket,
  BarChart3,
  CheckCircle,
  XCircle,
  Loader2,
  BookOpen,
  Cpu,
  Network,
  Database,
  ArrowRight,
  Github,
  User
} from 'lucide-react';

interface BenchmarkResult {
  status: string;
  complexity_score: string;
  document_hash: string;
  processed_by: string;
  processing_time_ms: number;
}

interface ThroughputResult {
  api: string;
  requestsPerSecond: number;
  averageLatency: number;
  totalTime: number;
}

export default function Home() {
  const [documentText, setDocumentText] = useState('');
  const [tsResult, setTsResult] = useState<BenchmarkResult | null>(null);
  const [rustResult, setRustResult] = useState<BenchmarkResult | null>(null);
  const [throughputResults, setThroughputResults] = useState<ThroughputResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingThroughput, setLoadingThroughput] = useState(false);
  const [winner, setWinner] = useState<'typescript' | 'rust' | null>(null);
  const [throughputWinner, setThroughputWinner] = useState<'typescript' | 'rust' | null>(null);

  const TS_API_URL = process.env.NEXT_PUBLIC_TS_API_URL || 'http://localhost:8080';
  const RUST_API_URL = process.env.NEXT_PUBLIC_RUST_API_URL || 'http://localhost:8081';

  useEffect(() => {
    if (tsResult && rustResult) {
      setWinner(tsResult.processing_time_ms > rustResult.processing_time_ms ? 'rust' : 'typescript');
    }
  }, [tsResult, rustResult]);

  useEffect(() => {
    if (throughputResults.length === 2) {
      const tsThrough = throughputResults.find(r => r.api === 'TypeScript');
      const rustThrough = throughputResults.find(r => r.api === 'Rust');
      if (tsThrough && rustThrough) {
        setThroughputWinner(rustThrough.requestsPerSecond > tsThrough.requestsPerSecond ? 'rust' : 'typescript');
      }
    }
  }, [throughputResults]);

  const benchmarkAPI = async (apiUrl: string, apiName: string) => {
    try {
      const response = await axios.post(`${apiUrl}/process`, {
        document_text: documentText
      });
      return response.data;
    } catch (error) {
      console.error(`Error benchmarking ${apiName}:`, error);
      return null;
    }
  };

  const runThroughputTest = async (apiUrl: string, apiName: string, requests: number = 500) => {
    const startTime = performance.now();
    const promises = Array(requests).fill(null).map(() => 
      axios.post(`${apiUrl}/process`, { document_text: documentText })
    );
    
    try {
      const results = await Promise.all(promises);
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      
      const latencies = results.map(r => r.data.processing_time_ms);
      const averageLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;
      const requestsPerSecond = (requests / totalTime) * 1000;
      
      return {
        api: apiName,
        requestsPerSecond: Math.round(requestsPerSecond * 100) / 100,
        averageLatency: Math.round(averageLatency * 100) / 100,
        totalTime: Math.round(totalTime)
      };
    } catch (error) {
      console.error(`Throughput test failed for ${apiName}:`, error);
      return null;
    }
  };

  const handleBenchmarkTS = async () => {
    setLoading(true);
    setWinner(null);
    const result = await benchmarkAPI(TS_API_URL, 'TypeScript');
    setTsResult(result);
    setLoading(false);
  };

  const handleBenchmarkRust = async () => {
    setLoading(true);
    setWinner(null);
    const result = await benchmarkAPI(RUST_API_URL, 'Rust');
    setRustResult(result);
    setLoading(false);
  };

  const handleBothBenchmarks = async () => {
    setLoading(true);
    setWinner(null);
    const [ts, rust] = await Promise.all([
      benchmarkAPI(TS_API_URL, 'TypeScript'),
      benchmarkAPI(RUST_API_URL, 'Rust')
    ]);
    setTsResult(ts);
    setRustResult(rust);
    setLoading(false);
  };

  const handleThroughputTest = async () => {
    if (!documentText) {
      alert('Please enter a document text');
      return;
    }
    
    setLoadingThroughput(true);
    setThroughputResults([]);
    setThroughputWinner(null);
    
    const [tsThrough, rustThrough] = await Promise.all([
      runThroughputTest(TS_API_URL, 'TypeScript'),
      runThroughputTest(RUST_API_URL, 'Rust')
    ]);
    
    const results = [];
    if (tsThrough) results.push(tsThrough);
    if (rustThrough) results.push(rustThrough);
    
    setThroughputResults(results);
    setLoadingThroughput(false);
  };

  const getSpeedupFactor = () => {
    if (!tsResult || !rustResult) return null;
    return (tsResult.processing_time_ms / rustResult.processing_time_ms).toFixed(1);
  };

  const getThroughputSpeedup = () => {
    if (throughputResults.length !== 2) return null;
    const tsThrough = throughputResults.find(r => r.api === 'TypeScript');
    const rustThrough = throughputResults.find(r => r.api === 'Rust');
    if (!tsThrough || !rustThrough) return null;
    return (rustThrough.requestsPerSecond / tsThrough.requestsPerSecond).toFixed(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-black opacity-50"></div>
      <div className="absolute inset-0 bg-gradient-to-tr from-purple-900/20 via-transparent to-blue-900/20"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto p-8">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-500 to-orange-500 bg-clip-text text-transparent">
            API Performance Battle
          </h1>
          <div className="flex justify-center items-center gap-8 text-2xl">
            <div className="flex items-center gap-2">
              <Code className="w-8 h-8 text-blue-400" />
              <span className="font-semibold">TypeScript</span>
            </div>
            <span className="text-3xl">VS</span>
            <div className="flex items-center gap-2">
              <Rocket className="w-8 h-8 text-orange-500" />
              <span className="font-semibold">Rust</span>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gray-800/50 backdrop-blur-lg rounded-2xl shadow-2xl p-8 mb-8 border border-gray-700"
        >
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Server className="w-6 h-6" />
            Test Document
          </h2>
          <textarea
            className="w-full h-32 p-4 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            placeholder="Paste a long text here to test processing performance..."
            value={documentText}
            onChange={(e) => setDocumentText(e.target.value)}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleBenchmarkTS}
              disabled={loading || !documentText}
              className="relative overflow-hidden bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-4 rounded-lg font-semibold disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" /> : <Code className="w-5 h-5" />}
              Test TypeScript
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleBenchmarkRust}
              disabled={loading || !documentText}
              className="relative overflow-hidden bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-4 rounded-lg font-semibold disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" /> : <Rocket className="w-5 h-5" />}
              Test Rust
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleBothBenchmarks}
              disabled={loading || !documentText}
              className="relative overflow-hidden bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-4 rounded-lg font-semibold disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" /> : <Zap className="w-5 h-5" />}
              Full Battle!
            </motion.button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <AnimatePresence>
            {tsResult && (
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className={`bg-gradient-to-br from-blue-900/30 to-blue-800/30 backdrop-blur-lg rounded-2xl p-6 border ${
                  winner === 'typescript' ? 'border-green-500 shadow-green-500/50' : 'border-blue-600'
                } shadow-xl`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Code className="w-6 h-6 text-blue-400" />
                    TypeScript
                  </h3>
                  {winner === 'typescript' && (
                    <Trophy className="w-6 h-6 text-yellow-400 animate-bounce" />
                  )}
                </div>
                
                <div className="space-y-4">
                  <div className="bg-gray-900/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-400 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Latency
                      </span>
                      <span className="text-2xl font-bold text-blue-400">
                        <CountUp 
                          end={tsResult.processing_time_ms} 
                          decimals={2}
                          suffix=" ms"
                          duration={1}
                        />
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-sm space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Status:</span>
                      <span className={tsResult.status === 'success' ? 'text-green-400' : 'text-red-400'}>
                        {tsResult.status === 'success' ? (
                          <CheckCircle className="w-4 h-4 inline mr-1" />
                        ) : (
                          <XCircle className="w-4 h-4 inline mr-1" />
                        )}
                        {tsResult.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Complexity:</span>
                      <span className="text-gray-300">{tsResult.complexity_score}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {rustResult && (
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                className={`bg-gradient-to-br from-orange-900/30 to-orange-800/30 backdrop-blur-lg rounded-2xl p-6 border ${
                  winner === 'rust' ? 'border-green-500 shadow-green-500/50' : 'border-orange-600'
                } shadow-xl`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Rocket className="w-6 h-6 text-orange-500" />
                    Rust
                  </h3>
                  {winner === 'rust' && (
                    <Trophy className="w-6 h-6 text-yellow-400 animate-bounce" />
                  )}
                </div>
                
                <div className="space-y-4">
                  <div className="bg-gray-900/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-400 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Latency
                      </span>
                      <span className="text-2xl font-bold text-orange-400">
                        <CountUp 
                          end={rustResult.processing_time_ms} 
                          decimals={2}
                          suffix=" ms"
                          duration={1}
                        />
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-sm space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Status:</span>
                      <span className={rustResult.status === 'success' ? 'text-green-400' : 'text-red-400'}>
                        {rustResult.status === 'success' ? (
                          <CheckCircle className="w-4 h-4 inline mr-1" />
                        ) : (
                          <XCircle className="w-4 h-4 inline mr-1" />
                        )}
                        {rustResult.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Complexity:</span>
                      <span className="text-gray-300">{rustResult.complexity_score}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {winner && getSpeedupFactor() && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-green-900/30 to-green-800/30 backdrop-blur-lg rounded-2xl p-6 mb-8 border border-green-600 shadow-xl"
          >
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-2">
                🏆 {winner === 'rust' ? 'Rust' : 'TypeScript'} Wins!
              </h3>
              <p className="text-4xl font-bold text-green-400">
                {getSpeedupFactor()}x faster
              </p>
            </div>
          </motion.div>
        )}

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-gray-700"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Activity className="w-6 h-6" />
              Load Test (500 requests)
            </h2>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleThroughputTest}
              disabled={loadingThroughput || !documentText}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50 transition-all flex items-center gap-2"
            >
              {loadingThroughput ? (
                <>
                  <Loader2 className="animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <BarChart3 className="w-5 h-5" />
                  Start Load Test
                </>
              )}
            </motion.button>
          </div>

          {throughputResults.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {throughputResults.map((result) => (
                <motion.div
                  key={result.api}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`bg-gray-900/50 rounded-lg p-6 border ${
                    throughputWinner === (result.api === 'Rust' ? 'rust' : 'typescript')
                      ? 'border-green-500'
                      : 'border-gray-600'
                  }`}
                >
                  <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                    {result.api === 'Rust' ? (
                      <Rocket className="w-5 h-5 text-orange-500" />
                    ) : (
                      <Code className="w-5 h-5 text-blue-400" />
                    )}
                    {result.api}
                    {throughputWinner === (result.api === 'Rust' ? 'rust' : 'typescript') && (
                      <Trophy className="w-5 h-5 text-yellow-400 ml-auto" />
                    )}
                  </h4>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Requests/sec:</span>
                      <span className="text-2xl font-bold text-green-400">
                        <CountUp 
                          end={result.requestsPerSecond} 
                          decimals={2}
                          duration={1.5}
                        />
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Average latency:</span>
                      <span className="text-lg font-semibold">
                        <CountUp 
                          end={result.averageLatency} 
                          decimals={2}
                          suffix=" ms"
                          duration={1}
                        />
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Total time:</span>
                      <span className="text-lg">
                        <CountUp 
                          end={result.totalTime} 
                          suffix=" ms"
                          duration={1}
                        />
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {throughputWinner && getThroughputSpeedup() && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 bg-gradient-to-r from-purple-900/30 to-pink-900/30 backdrop-blur-lg rounded-lg p-4 text-center border border-purple-600"
            >
              <p className="text-xl">
                {throughputWinner === 'rust' ? '🦀 Rust' : '📘 TypeScript'} processes{' '}
                <span className="text-3xl font-bold text-purple-400">
                  {getThroughputSpeedup()}x
                </span>{' '}
                more requests per second!
              </p>
            </motion.div>
          )}
        </motion.div>

        {/* System Explanation Component */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 backdrop-blur-lg rounded-2xl shadow-2xl p-8 mt-8 border border-gray-700"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-500 to-orange-500 bg-clip-text text-transparent flex items-center justify-center gap-3">
              <BookOpen className="w-8 h-8 text-purple-400" />
              How This System Works
            </h2>
            <p className="text-gray-300 text-lg max-w-4xl mx-auto">
              This benchmark compares the performance of two identical APIs built with different technologies: 
              <span className="text-blue-400 font-semibold">TypeScript/Node.js</span> and <span className="text-orange-400 font-semibold">Rust</span>.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Architecture Overview */}
            <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-600">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Cpu className="w-6 h-6 text-blue-400" />
                Architecture Overview
              </h3>
              <div className="space-y-4 text-gray-300">
                <div className="flex items-start gap-3">
                  <ArrowRight className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-white">Frontend (Next.js)</p>
                    <p className="text-sm">React-based UI that sends HTTP requests to both APIs</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <ArrowRight className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-white">TypeScript API (Port 8080)</p>
                    <p className="text-sm">Express.js server with text processing logic</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <ArrowRight className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-white">Rust API (Port 8081)</p>
                    <p className="text-sm">Actix-web server with identical processing logic</p>
                  </div>
                </div>
              </div>
            </div>

            {/* What Gets Tested */}
            <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-600">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Database className="w-6 h-6 text-green-400" />
                What Gets Tested
              </h3>
              <div className="space-y-4 text-gray-300">
                <div className="flex items-start gap-3">
                  <ArrowRight className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-white">Text Processing</p>
                    <p className="text-sm">Both APIs analyze document complexity and generate hashes</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <ArrowRight className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-white">Single Request Latency</p>
                    <p className="text-sm">How fast each API processes one document</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <ArrowRight className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-white">Throughput (500 requests)</p>
                    <p className="text-sm">How many requests each API can handle simultaneously</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Metrics Explained */}
          <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-xl p-6 border border-purple-600 mb-8">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Network className="w-6 h-6 text-purple-400" />
              Understanding the Metrics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-gray-300">
              <div className="text-center">
                <Clock className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <h4 className="font-semibold text-white mb-2">Latency</h4>
                <p className="text-sm">Time taken to process a single request. Lower is better.</p>
              </div>
              <div className="text-center">
                <Activity className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <h4 className="font-semibold text-white mb-2">Requests/Second</h4>
                <p className="text-sm">How many requests the API can handle per second. Higher is better.</p>
              </div>
              <div className="text-center">
                <BarChart3 className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                <h4 className="font-semibold text-white mb-2">Throughput</h4>
                <p className="text-sm">Overall performance under load with multiple concurrent requests.</p>
              </div>
            </div>
          </div>

          {/* Why This Matters */}
          <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-600 mb-8">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-400" />
              Why This Comparison Matters
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-300">
              <div>
                <h4 className="font-semibold text-blue-400 mb-2">TypeScript/Node.js Strengths:</h4>
                <ul className="space-y-1 text-sm">
                  <li>• Rapid development and prototyping</li>
                  <li>• Large ecosystem and community</li>
                  <li>• Easy to find developers</li>
                  <li>• Great for I/O-heavy applications</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-orange-400 mb-2">Rust Strengths:</h4>
                <ul className="space-y-1 text-sm">
                  <li>• Superior performance and memory efficiency</li>
                  <li>• Memory safety without garbage collection</li>
                  <li>• Better for CPU-intensive tasks</li>
                  <li>• Excellent for system-level programming</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Getting Started */}
          <div className="bg-gradient-to-r from-green-900/30 to-teal-900/30 rounded-xl p-6 border border-green-600">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Rocket className="w-6 h-6 text-green-400" />
              Try It Yourself
            </h3>
            <div className="text-gray-300 space-y-3">
              <p className="text-sm">
                <strong className="text-white">Step 1:</strong> Paste any long text in the input field above (articles, documentation, etc.)
              </p>
              <p className="text-sm">
                <strong className="text-white">Step 2:</strong> Click "Full Battle!" to test both APIs simultaneously
              </p>
              <p className="text-sm">
                <strong className="text-white">Step 3:</strong> Run the load test to see how they perform under pressure
              </p>
              <p className="text-sm">
                <strong className="text-white">Step 4:</strong> Compare the results and see which technology fits your use case
              </p>
            </div>
          </div>
        </motion.div>

        {/* Developer Information */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 backdrop-blur-lg rounded-2xl shadow-2xl p-6 mt-8 border border-gray-600 text-center"
        >
          <div className="flex items-center justify-center gap-4 mb-4">
            <User className="w-6 h-6 text-purple-400" />
            <h3 className="text-xl font-bold text-white">Built by Marcel Scog</h3>
          </div>
          <div className="flex items-center justify-center gap-6">
            <a 
              href="https://github.com/marcelxv" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
            >
              <Github className="w-5 h-5" />
              @marcelxv
            </a>
            <span className="text-gray-500">•</span>
            <span className="text-gray-300">CTO @ SURFE SOFTWARE SOLUTIONS</span>
          </div>
          <p className="text-gray-400 text-sm mt-2">
            Passionate about modern web development, AI-based solutions, and fast prototyping
          </p>
        </motion.div>
      </div>
    </div>
  );
}