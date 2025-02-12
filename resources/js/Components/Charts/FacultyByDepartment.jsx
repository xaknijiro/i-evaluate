import { usePage } from '@inertiajs/react';
import { Paper, Typography } from '@mui/material';
import { BarChart } from '@mui/x-charts';
import axios from 'axios';
import * as React from 'react';

export default function FacultyByDepartment() {
    const { auth } = usePage().props;
    const { token } = auth;

    const [isLoading, setIsLoading] = React.useState(true);
    const [xAxisLabel, setXAxisLabel] = React.useState([]);
    const [data, setData] = React.useState([]);

    React.useEffect(() => {
        async function fetchData() {
            const response = await axios.get('/api/charts/bar/faculty-by-department', {
                headers: {
                    Authorization: `Bearer ${token}`
                },
            });
            const { data } = response;
            const { chartData } = data;
            
            setIsLoading(false);
            setXAxisLabel(chartData.map((item) => item.label));
            setData(chartData.map((item) => item.value));
        }

        fetchData();
    }, []);

    return <Paper sx={{ p: 2 }}>
        {!isLoading && <BarChart
            height={300}
            xAxis={[
                {
                    scaleType: 'band',
                    data: xAxisLabel,
                },
            ]}
            series={[
                {
                    data,
                }
            ]}
            sx={{
                width: '100%',
            }}
        />}
        <Typography variant='subtitle1' textAlign='center'>
            Faculty by Department
        </Typography>
    </Paper>;
}