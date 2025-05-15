import StressDetector from './shared/modules/stress-detector/StressDetector';
import './App.css';

function App() {
  return (
    <div className="app">
      <h1>Stress Detection Demo</h1>
      <p className="app-description">
        This demo uses face-api.js to analyze facial expressions from your webcam and detect potential signs of stress.
        First, record a 5-second video clip, which will then be analyzed for stress indicators.
      </p>

      <StressDetector
        onAnalysisComplete={(result) => {
          console.log('Analysis complete:', result);
        }}
      />
    </div>
  );
}

export default App;
