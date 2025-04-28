import { usePage } from '@inertiajs/react';
import { Paper, Typography } from '@mui/material';
import { PieChart } from '@mui/x-charts';
import axios from 'axios';
import * as React from 'react';

export default function UsersByGender() {
    const { auth } = usePage().props;
    const { token } = auth;

    const [isLoading, setIsLoading] = React.useState(true);
    const [data, setData] = React.useState([]);
    const [colors, setColors] = React.useState([]);

    React.useEffect(() => {
        async function fetchData() {
            const response = await axios.get('/api/charts/pie/users-by-gender', {
                headers: {
                    Authorization: `Bearer ${token}`
                },
            });
            const { chartData, colors } = response.data;
            setIsLoading(false);
            setData(chartData);
            setColors(colors);
        }

        fetchData();
    }, []);

    return <Paper sx={{ p: 2 }}>
        {!isLoading && <PieChart
            height={175}
            colors={colors}
            series={[
                {
                    data,
                },
            ]}
            sx={{
                width: '100%',
            }}
        />}
        <Typography variant='subtitle1' textAlign='center'>
            Users by Gender
        </Typography>
    </Paper>;
}