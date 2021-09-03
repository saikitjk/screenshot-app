import Header from "./components/header/header";
import Main from "./components/main/main";
import ControlPanel from "./components/controlPanel/controlPanel";
import Instruction from "./components/instruction/instruction";
import "./App.css";

function App() {
  return (
    <div className="App">
      <Header />
      <Main />
      <ControlPanel />
      <Instruction />
    </div>
  );
}

export default App;
