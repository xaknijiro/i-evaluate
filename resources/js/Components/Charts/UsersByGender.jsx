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

    React.useEffect(() => {
        async function fetchData() {
            const response = await axios.get('/api/charts/pie/users-by-gender', {
                headers: {
                    Authorization: `Bearer ${token}`
                },
            });
            setIsLoading(false);
            setData(response.data);   
        }

        fetchData();
    }, []);

    return <Paper sx={{ p: 2 }}>
        {!isLoading && <PieChart
            height={300}
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