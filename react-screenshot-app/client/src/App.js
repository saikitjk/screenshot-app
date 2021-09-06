import Header from "./components/header/header";
import Main from "./components/main/main";
import Instruction from "./components/instruction/instruction";
import { Row, Container, Col } from "reactstrap";
import "./App.css";

function App() {
  return (
    <div className="App">
      <Container>
        <Header />
        <Row>
          <Col>
            <Main />
          </Col>
        </Row>
        <Row>
          <Col>
            <Instruction />
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default App;
