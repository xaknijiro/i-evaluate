import { usePage } from '@inertiajs/react';
import { Chip, Divider, Grid, Paper, Typography } from '@mui/material';
import { BarChart, PieChart } from '@mui/x-charts';
import axios from 'axios';
import * as React from 'react';

export default function EvaluationStatus() {
    const { auth } = usePage().props;
    const { token } = auth;

    const [isLoading, setIsLoading] = React.useState(true);
    const [selectedAcademicYear, setSelectedAcademicYear] = React.useState();
    const [selectedSemester, setSelectedSemester] = React.useState();
    const [evaluationTypes, setEvaluationTypes] = React.useState();
    const [data, setData] = React.useState();
    const [evaluationSchedulesByDepartment, setEvaluationSchedulesByDepartment] = React.useState();

    React.useEffect(() => {
        async function fetchData() {
            const response = await axios.get('/api/charts/pie/evaluation-status', {
                headers: {
                    Authorization: `Bearer ${token}`
                },
            });

            const { data } = response;
            const {
                selectedAcademicYear,
                selectedSemester,
                evaluationTypes,
                evaluationSchedules,
                evaluationSchedulesByDepartment
            } = data;

            setIsLoading(false);
            setSelectedAcademicYear(selectedAcademicYear);
            setSelectedSemester(selectedSemester);
            setEvaluationTypes(evaluationTypes);
            setData(evaluationSchedules);
            setEvaluationSchedulesByDepartment(evaluationSchedulesByDepartment);
        }

        fetchData();
    }, []);

    return <Paper sx={{ p: 2 }}>
        {!isLoading && <>
            <Typography textAlign="center" variant="h4">
                Evaluation Status
            </Typography>
            <Typography textAlign="center">
                {selectedSemester.title} - A.Y. {selectedAcademicYear}
            </Typography>
            <Divider sx={{ m: 2 }} />
            <Grid container spacing={2}>
                {!isLoading && evaluationTypes.map((evaluationType) => {
                    const evaluationTypeCode = evaluationType.code;
                    const evaluationTypeData = data[evaluationTypeCode] ?? {};
                    const { label, chartData } = evaluationTypeData;
                    const { statuses, respondents } = chartData;

                    const statusesByDepartmentDataset = [];
                    const respondentsByDepartmentDataset = [];
                    const departments = Object.keys(evaluationSchedulesByDepartment);
                    
                    departments.forEach((department) => {
                        const evaluationSchedule = evaluationSchedulesByDepartment[department][evaluationTypeCode];
                        const { chartData: chartDataByDepartment } = evaluationSchedule || {};
                        const { statuses: statusesByDepartment } = chartDataByDepartment;

                        if (statusesByDepartment) {
                            statusesByDepartmentDataset.push({
                                department,
                                open: statusesByDepartment.find((item) => item.label === 'Open').value,
                                closed: statusesByDepartment.find((item) => item.label === 'Closed').value,
                            });
                        } else {
                            statusesByDepartmentDataset.push({
                                department,
                                open: 0,
                                closed: 0,
                            });
                        }
                    });

                    departments.forEach((department) => {
                        const evaluationSchedule = evaluationSchedulesByDepartment[department][evaluationTypeCode];
                        const { chartData: chartDataByDepartment } = evaluationSchedule || {};
                        const { respondents: respondentsByDepartment } = chartDataByDepartment;

                        if (respondentsByDepartment) {
                            respondentsByDepartmentDataset.push({
                                department,
                                responded: respondentsByDepartment.find((item) => item.label === 'Responded').value,
                                did_not_respond: respondentsByDepartment.find((item) => item.label === 'Did Not Respond').value,
                            });
                        } else {
                            respondentsByDepartmentDataset.push({
                                department,
                                responded: 0,
                                did_not_respond: 0,
                            });
                        }
                    });

                    return <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                        <Paper sx={{ p: 2 }}>
                            <Typography textAlign="center">
                                {label}
                            </Typography>
                            <Divider sx={{ m: 2 }} />
                            <Grid container spacing={2}>
                                <Grid item xl={6} lg={6} md={12} sm={12} xs={12}>
                                    <PieChart
                                        height={300}
                                        series={[
                                            {
                                                data: statuses ?? [],
                                            },
                                        ]}
                                        sx={{
                                            width: '100%',
                                        }}
                                    />
                                    <Typography variant='subtitle1' textAlign='center'>Overall Open/Closed Evaluation</Typography>
                                </Grid>
                                <Grid item xl={6} lg={6} md={12} sm={12} xs={12}>
                                    <BarChart
                                        dataset={statusesByDepartmentDataset}
                                        height={300}
                                        xAxis={[
                                            {
                                                scaleType: 'band',
                                                dataKey: 'department',
                                            },
                                        ]}
                                        series={[
                                            { dataKey: 'open', label: 'Open' },
                                            { dataKey: 'closed', label: 'Closed' },
                                        ]}
                                        sx={{
                                            width: '100%',
                                        }}
                                    />
                                    <Typography variant='subtitle1' textAlign='center'>Open/Closed Evaluation by Department</Typography>        
                                </Grid>
                            </Grid>
                            <Divider sx={{ m: 2 }}/>
                            <Grid container spacing={2}>
                                <Grid item xl={6} lg={6} md={12} sm={12} xs={12}>
                                    <PieChart
                                        height={300}
                                        series={[
                                            {
                                                data: respondents ?? [],
                                            },
                                        ]}
                                        sx={{
                                            width: '100%',
                                        }}
                                    />
                                    <Typography variant='subtitle1' textAlign='center'>Overall Response Rate</Typography>
                                </Grid>
                                <Grid item xl={6} lg={6} md={12} sm={12} xs={12}>
                                    <BarChart
                                        dataset={respondentsByDepartmentDataset}
                                        height={300}
                                        xAxis={[
                                            {
                                                scaleType: 'band',
                                                dataKey: 'department',
                                            },
                                        ]}
                                        series={[
                                            { dataKey: 'did_not_respond', label: 'Did Not Respond' },
                                            { dataKey: 'responded', label: 'Responded' },
                                        ]}
                                        sx={{
                                            width: '100%',
                                        }}
                                    />
                                    <Typography variant='subtitle1' textAlign='center'>Response Rate by Department</Typography>        
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>;
                })}
            </Grid>
        </>}
    </Paper>;
}