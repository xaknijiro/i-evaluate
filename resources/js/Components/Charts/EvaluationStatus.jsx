import { usePage } from '@inertiajs/react';
import { Box, Divider, Grid2, MenuItem, Paper, Tab, Tabs, TextField, Typography } from '@mui/material';
import { BarChart, PieChart } from '@mui/x-charts';
import { DatePicker } from '@mui/x-date-pickers';
import axios from 'axios';
import dayjs from 'dayjs';
import * as React from 'react';
import PropTypes from 'prop-types';

function CustomTabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
}

CustomTabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
};

function a11yProps(index) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}

export default function EvaluationStatus() {
    const { auth } = usePage().props;
    const { token } = auth;

    const [selectedTab, setSelectedTab] = React.useState(0);
    const handleTabChange = (event, newValue) => {
        setSelectedTab(newValue);
    };

    const [isLoading, setIsLoading] = React.useState(true);
    const [semesters, setSemesters] = React.useState();
    const [selectedAcademicYearStart, setSelectedAcademicYearStart] = React.useState();
    const [selectedAcademicYearEnd, setSelectedAcademicYearEnd] = React.useState();
    const [selectedSemesterId, setSelectedSemesterId] = React.useState();
    const [evaluationTypes, setEvaluationTypes] = React.useState();
    const [data, setData] = React.useState();
    const [evaluationSchedulesByDepartment, setEvaluationSchedulesByDepartment] = React.useState();

    const fetchData = async (newSelectedSemesterId, newSelectedAcademicYear) => {

        const params = {};

        if (newSelectedSemesterId) {
            params['semester_id'] = newSelectedSemesterId;
        }

        if (newSelectedAcademicYear) {
            params['academic_year'] = newSelectedAcademicYear;
        }

        const response = await axios.get('/api/charts/pie/evaluation-status', {
            headers: {
                Authorization: `Bearer ${token}`
            },
            params,
        });

        const { data } = response;
        const {
            semesters,
            selectedAcademicYear,
            selectedSemester,
            evaluationTypes,
            evaluationSchedules,
            evaluationSchedulesByDepartment
        } = data;

        const segment = String(selectedAcademicYear).split('-');
        const selectedAcademicYearStart = dayjs(segment[0]);
        const selectedAcademicYearEnd = dayjs(segment[1]);

        setIsLoading(false);
        setSemesters(semesters);
        setSelectedAcademicYearStart(selectedAcademicYearStart);
        setSelectedAcademicYearEnd(selectedAcademicYearEnd);
        setSelectedSemesterId(selectedSemester.id);
        setEvaluationTypes(evaluationTypes);
        setData(evaluationSchedules);
        setEvaluationSchedulesByDepartment(evaluationSchedulesByDepartment);
    };

    React.useEffect(() => {
        fetchData();
    }, []);

    return <Paper sx={{ p: 2 }}>
        {!isLoading && <>
            <Typography textAlign="center" variant="h4">
                Evaluation Status
            </Typography>

            <Paper
                sx={{ mb: 2, p: 2 }}
                variant="outlined"
            >
                <Grid2 container spacing={2} marginBottom={2}>
                    <Grid2 item size={4}>
                        <TextField
                            label="Semester"
                            name="semester"
                            value={selectedSemesterId}
                            onChange={(e) => {
                                const newSelectedSemesterId = e.target.value;
                                const curSelectedAcademicYear = selectedAcademicYearStart
                                    ? `${selectedAcademicYearStart.year()}-${selectedAcademicYearEnd.year()}`
                                    : undefined;
                                setSelectedSemesterId(newSelectedSemesterId);
                                fetchData(newSelectedSemesterId, curSelectedAcademicYear);
                            }}
                            fullWidth
                            select
                        >
                            {semesters.map((semester) => <MenuItem
                                key={`semester-${semester.id}`}
                                value={semester.id}
                            >{semester.title}</MenuItem>)}
                        </TextField>
                    </Grid2>
                    <Grid2 item size={4}>
                        <DatePicker
                            format="YYYY"
                            label="Academic Year Start"
                            name="academic_year_start"
                            value={selectedAcademicYearStart}
                            onChange={(e) => {
                                setSelectedAcademicYearStart(e);
                                setSelectedAcademicYearEnd(e?.add(1, 'year'));
                                const newSelectedAcademicYear = e
                                    ? `${e?.year()}-${e?.add(1, 'year').year()}`
                                    : undefined;
                                fetchData(selectedSemesterId, newSelectedAcademicYear);
                            }}
                            sx={{ width: "100%" }}
                            views={["year"]}
                        />
                    </Grid2>
                    <Grid2 item size={4}>
                        <DatePicker
                            format="YYYY"
                            label="Academic Year End"
                            name="academic_year_end"
                            value={selectedAcademicYearEnd}
                            sx={{ width: "100%" }}
                            views={["year"]}
                            readOnly
                        />
                    </Grid2>
                </Grid2>
            </Paper>
            
            <Box sx={{ width: '100%' }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    {!isLoading && !!evaluationTypes.length && <Tabs value={selectedTab} onChange={handleTabChange} aria-label="evaluation types">
                        {evaluationTypes.map((evaluationType, index) => <Tab
                            label={evaluationType.title}
                            {...a11yProps(index)}
                        />)}
                    </Tabs>}
                </Box>
                {!isLoading && !!evaluationTypes.length && evaluationTypes.map((evaluationType, index) => {
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

                    return <CustomTabPanel value={selectedTab} index={index}>
                        <Grid2 item size={12}>
                            <Paper sx={{ p: 2 }}>
                                <Typography textAlign="center">
                                    {label}
                                </Typography>
                                <Divider sx={{ m: 2 }} />
                                <Grid2 container spacing={2}>
                                    <Grid2 item size={{ xl: 6, lg: 6, md: 12, sm: 12, xs: 12 }}>
                                        <PieChart
                                            height={175}
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
                                    </Grid2>
                                    <Grid2 item size={{ xl: 6, lg: 6, md: 12, sm: 12, xs: 12 }}>
                                        <BarChart
                                            dataset={statusesByDepartmentDataset}
                                            height={175}
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
                                    </Grid2>
                                </Grid2>
                                <Divider sx={{ m: 2 }} />
                                <Grid2 container spacing={2}>
                                    <Grid2 item size={{ xl: 6, lg: 6, md: 12, sm: 12, xs: 12 }}>
                                        <PieChart
                                            height={175}
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
                                    </Grid2>
                                    <Grid2 item size={{ xl: 6, lg: 6, md: 12, sm: 12, xs: 12 }}>
                                        <BarChart
                                            dataset={respondentsByDepartmentDataset}
                                            height={175}
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
                                    </Grid2>
                                </Grid2>
                            </Paper>
                        </Grid2>
                    </CustomTabPanel>;
                })}
            </Box>
        </>}
    </Paper>;
}