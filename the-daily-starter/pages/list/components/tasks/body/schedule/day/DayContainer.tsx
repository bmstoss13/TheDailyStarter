import HoursContainer from "./hours/HoursContainer";

const DayContainer = () => {
    return (
        <div className={`flex w-full h-[62vh] mt-[10px] overflow-auto`}>
            <HoursContainer />
        </div>
    )
}

export default DayContainer;