import axios from "axios";
import { useState } from "react";
import "./App.css";

export default function App() {
    const [users, setUsers] = useState([]);
    const [username, setUsername] = useState();
    const [player, setPlayer] = useState({
        name: "",
        username: "",
        country: "",
    });
    const [score, setScore] = useState({ username: "", score: "" });
    const [isLoading, setIsLoading] = useState(false);


    const getData = (username) => {
        setIsLoading(true);
        axios
            .get(`/scores/${username}`)
            .then((response) => {
                setUsers(response.data);
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    const onChangeInputPlayer = (e) => {
        setPlayer({ ...player, [e.target.name]: e.target.value });
    };

    const addPlayer = (e) => {
        e.preventDefault();
        axios.post("/players", player).then(() => {
            alert("Player created.");
        });
    };

    const onChangeInputScore = (e) => {
        setScore({ ...score, [e.target.name]: e.target.value });
    };

    const addScore = (e) => {
        e.preventDefault();
        axios.post("/scores", score).then(() => {
            alert("Score added.");
        });
    };

    const resetDay = (e) => {
        axios.get("/resetDay").then(()=>{
            alert("Day reset")
        })
    }

    const resetWeek = (e) => {
        axios.get("/resetWeek").then(()=>{
            alert("Week reset")
        })
    }

    const getDailyDiff = (diff) => {
        if (diff > 0)
            return (
                <div className="text-success">
                    <i className="fas fa-chevron-up "></i>
                    <span>{diff}</span>
                </div>
            );
        else if (diff < 0)
            return (
                <div className="text-danger">
                    <i className="fas fa-chevron-down "></i>
                    <span>{diff}</span>
                </div>
            );
        else return <i className="fas fa-minus text-warning"></i>;
    };

    return (
        <div className="App container">
            <table className="table">
                <thead>
                    <tr>
                        <th scope="col" className="dataColor">
                            Rank
                        </th>
                        <th scope="col" className="dataColor">
                            Username
                        </th>
                        <th scope="col" className="dataColor">
                            Score
                        </th>
                        <th scope="col" className="dataColor">
                            Country
                        </th>
                        <th scope="col" className="dataColor">
                            Daily Diff
                        </th>
                    </tr>
                </thead>

                <tbody>
                    {users.map((user) => (
                        <tr
                            className={`${
                                user.username === username && "userPicked"
                            }`}
                            key={user.username}
                        >
                            <th scope="row">{user.rank}</th>
                            <td>{user.username}</td>
                            <td className="scoreColor">{user.score}</td>
                            <td>{user.country}</td>
                            <td>{getDailyDiff(user.dailyDiff)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <button
                type="button"
                className="btn btn-dark"
                onClick={() => getData()}
            >
                Get Top100
            </button>

            <div className="input-group p-5">
                <div className="input-group-prepend">
                    <button
                        className="btn btn-outline-secondary"
                        type="submit"
                        onClick={() => getData(username)}
                    >
                        Search User
                    </button>
                </div>
                <input
                    type="text"
                    className="form-control"
                    placeholder=""
                    aria-label=""
                    aria-describedby="basic-addon1"
                    onChange={(e) => {
                        setUsername(e.target.value);
                    }}
                />
            </div>

            {isLoading && <div>Loading...</div>}

            <form onSubmit={addPlayer}>
                <div>
                    <input
                        name="name"
                        placeholder="Name"
                        onChange={onChangeInputPlayer}
                    />
                </div>
                <div>
                    <input
                        name="username"
                        placeholder="Username"
                        onChange={onChangeInputPlayer}
                        required
                    />
                </div>
                <div>
                    <input
                        name="country"
                        placeholder="Country"
                        onChange={onChangeInputPlayer}
                    />
                </div>
                <div className="btn">
                    <button className="btn btn-dark">Add Player</button>
                </div>
            </form>
            <hr/>
            <form onSubmit={addScore}>
                <div>
                    <input
                        name="username"
                        placeholder="Username"
                        onChange={onChangeInputScore}
                    />
                </div>
                <div>
                    <input
                        type="number"
                        name="score"
                        placeholder="Score"
                        onChange={onChangeInputScore}
                        required
                    />
                </div>
                <div className="btn">
                    <button className="btn btn-dark">Add Score</button>
                </div>
            </form>
            <hr/>
            <button className="btn btn-dark my-2" onClick={()=>resetDay()}>Reset Day</button>
            <br/>
            <button className="btn btn-dark" onClick={()=>resetWeek()}>Reset Week</button>

        </div>
    );
}
