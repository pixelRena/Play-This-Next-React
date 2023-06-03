import { LoaderContext } from "../context/loader.context";
import { useContext } from "react";

const Loader = () => {
    const {isLoading, setIsLoading} = useContext(LoaderContext);

    return (
        isLoading && 
        <div id="loader-container">
            <div id="loader">
                <div></div>
                <div></div>
            </div>
        </div>
    );
}
 
export default Loader;