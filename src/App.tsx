import {Header} from "./components/Header.tsx";
import {KPISummary} from "./components/KPISummary.tsx";
import {OrderBook} from "./components/OrderBook.tsx";
import {Positions} from "./components/Positions.tsx";

function App() {

    return (
        <div>

            <Header/>

            <KPISummary/>

            <OrderBook/>

            <Positions/>


        </div>
    )
}

export default App
