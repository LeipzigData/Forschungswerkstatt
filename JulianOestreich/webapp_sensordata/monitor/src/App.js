import io from 'socket.io-client';
import React from 'react';
import {useEffect, useState} from 'react';

import {
    Area,
    AreaChart,
    Brush,
    CartesianGrid,
    Line,
    LineChart,
    XAxis,
    YAxis,
    Tooltip, ResponsiveContainer
} from 'recharts';
import {Container, Paper, AppBar, Toolbar, IconButton, MenuItem, Typography, Button, Box} from "@material-ui/core";
import { makeStyles } from '@material-ui/core/styles';

const socket = io('ws://0.0.0.0:7000/data', {
    transports: ['websocket', 'polling']
});

const useStyles = makeStyles({
    root: {
        background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
        border: 0,
        boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
        color: 'white',
    },
});

const App = ({}) => {
    const classes = useStyles();
    const [data, setData] = useState([]);
    const makeNum = bool => bool === true ? 1 : -1

    useEffect(() => {
        socket.on('update-data', newData => {
            setData(currentData => {
                if (currentData.length > 49) {
                    currentData.shift()
                }
                console.log(newData)
                newData.occupancy = makeNum(newData.occupancy)
                return currentData.concat(newData);
            });
        });
    }, []);

    const formatXAxis = (tickItem) => {
        let time = new Date(tickItem)
        return time.toLocaleTimeString()
    }

    const gradientOffset = () => {
        const dataMax = Math.max(...data.map(i => i.uv));
        const dataMin = Math.min(...data.map(i => i.uv));

        if (dataMax <= 0) {
            return 0;
        }
        if (dataMin >= 0) {
            return 1;
        }

        return dataMax / (dataMax - dataMin);
    };

    const off = gradientOffset();

    return (
        <Box>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" className={classes.title}>
                        Monitoring of Sensordata
                    </Typography>
                </Toolbar>
            </AppBar>

            <Container>
                    <Typography variant="h5">Recorded on: {data.length > 49 ? new Date(data[49].created_time).toDateString() : null}</Typography>
                    <div>
                        <div className="split left">
                            <div className="centered">
                                <Paper>
                                    <Typography color="textSecondary">
                                        Temperature
                                    </Typography>
                                    <ResponsiveContainer width="100%" height={200}>
                                        <LineChart
                                            data={data.map((d) => {
                                                return {
                                                    temperature: d.temperature,
                                                    created_time: d.created_time
                                                }
                                            })}
                                            syncId="anyId"
                                            margin={{
                                                top: 10, right: 30, left: 0, bottom: 0,
                                            }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3"/>
                                            <XAxis dataKey="created_time" tickFormatter={formatXAxis}/>
                                            <YAxis/>
                                            <Tooltip/>
                                            <Line type="monotone" dataKey="temperature" stroke="#8884d8" fill="#8884d8"/>
                                        </LineChart>
                                    </ResponsiveContainer>
                                </Paper>

                                <Paper>
                                    <Typography color="textSecondary">
                                        Light
                                    </Typography>
                                    <ResponsiveContainer width="100%" height={200}>
                                        <LineChart
                                            data={data.map((d) => {
                                                return {
                                                    light: d.light,
                                                    created_time: d.created_time
                                                }
                                            })}
                                            syncId="anyId"
                                            margin={{
                                                top: 10, right: 30, left: 0, bottom: 0,
                                            }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3"/>
                                            <XAxis dataKey="created_time" tickFormatter={formatXAxis}/>
                                            <YAxis/>
                                            <Tooltip/>
                                            <Line type="monotone" dataKey="light" stroke="#82ca9d" fill="#82ca9d"/>
                                        </LineChart>
                                    </ResponsiveContainer>
                                </Paper>
                            </div>
                        </div>

                        <div className="split right">
                            <div className="centered">
                                <Paper>
                                    <Typography color="textSecondary">
                                        Motion Count
                                    </Typography>
                                    <ResponsiveContainer width="100%" height={200}>
                                        <AreaChart
                                            width={800}
                                            height={200}
                                            data={data.map((d) => {
                                                return {
                                                    people_count: d.people_count,
                                                    created_time: d.created_time
                                                }
                                            })}
                                            syncId="anyId"
                                            margin={{
                                                top: 10, right: 30, left: 0, bottom: 0,
                                            }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3"/>
                                            <XAxis dataKey="created_time" tickFormatter={formatXAxis}/>
                                            <YAxis/>
                                            <Tooltip/>
                                            <Area type="monotone" dataKey="people_count" stroke="#82ca9d" fill="#82ca9d"/>
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </Paper>
                                <Paper>
                                    <Typography color="textSecondary">
                                        Occupancy
                                    </Typography>
                                    <ResponsiveContainer width="100%" height={200}>
                                        <AreaChart
                                            width={800}
                                            height={200}
                                            data={data.map((d) => {
                                                return {
                                                    occupancy: d.occupancy,
                                                    created_time: d.created_time
                                                }
                                            })}
                                            syncId="anyId"
                                            margin={{
                                                top: 10, right: 30, left: 0, bottom: 0,
                                            }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3"/>
                                            <XAxis dataKey="created_time" tickFormatter={formatXAxis}/>
                                            <YAxis/>
                                            <Tooltip/>
                                            <defs>
                                                <linearGradient id="splitColor" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset={off} stopColor="green" stopOpacity={1}/>
                                                    <stop offset={off} stopColor="red" stopOpacity={1}/>
                                                </linearGradient>
                                            </defs>
                                            <Area type="monotone" dataKey="occupancy" stroke="#000" fill="url(#splitColor)"/>
                                            <Brush/>
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </Paper>
                            </div>
                        </div>
                    </div>
        </Container>

</Box>



);
};

export default App;
