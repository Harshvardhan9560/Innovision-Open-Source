import FillUps from "./FillUps";
import Quiz from "./Quiz";
import Match from "./Match";

const TaskDecider = ({ task, roadmapId, chapterNumber, onCourseComplete }) => {
    return (
        <div>
            {task.type === "fill-in-the-blank" ? (
                <FillUps task={task} roadmapId={roadmapId} chapterNumber={chapterNumber} onCourseComplete={onCourseComplete} />
            ) : task.type === "multiple-choice" ? (
                <Quiz task={task} roadmapId={roadmapId} chapterNumber={chapterNumber} onCourseComplete={onCourseComplete} />
            ) : task.type === "match-the-following" ? (
                <Match task={task} roadmapId={roadmapId} chapterNumber={chapterNumber} onCourseComplete={onCourseComplete} />
            ) : (
                ""
            )}

        </div>
    );
};

export default TaskDecider;
