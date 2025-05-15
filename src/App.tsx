import StressDetector from './shared/modules/stress-detector/StressDetector';
import './App.css';

function App() {
  return (
    <div className="app">
      <h1>Stress Detection</h1>

      <StressDetector
        onAnalysisComplete={(result) => {
          console.log('Analysis complete:', result);
        }}
      />
    </div>
  );
}

export default App;
