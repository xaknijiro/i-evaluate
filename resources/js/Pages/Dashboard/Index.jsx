import _, { includes } from 'lodash';
import MainLayout from "../../MainLayout";
import { Badge, Button, Card, CardContent, Divider, Grid, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import React, { useMemo, useState } from 'react';
import { Assignment } from '@mui/icons-material';
import { useForm, usePage } from '@inertiajs/react';
import EvaluationTask from '../../Components/EvaluationTask';
import UsersByGender from '../../Components/Charts/UsersByGender';
import FacultyByDepartment from '../../Components/Charts/FacultyByDepartment';
import EvaluationStatus from '../../Components/Charts/EvaluationStatus';

const Index = ({ pendingTasksAsEvaluator }) => {
    const { auth } = usePage().props;
    const { roles } = auth;

    const [completeEvaluationTask, setCompleteEvaluationTask] = useState(null);

    const {
        clearErrors: clearErrorsEvaluationTask,
        data: dataEvaluationTask,
        errors: errorsPatchEvaluationTask,
        patch: patchEvaluationTask,
        setData: setDataEvaluationTask,
        reset: resetEvaluationTask,
    } = useForm();

    const handleCompleteEvaluationTask = useMemo(() => (event, task) => {
        event.preventDefault();
        setCompleteEvaluationTask(task);
    });

    const handleCloseCompleteEvaluationTask = useMemo(() => () => {
        clearErrorsEvaluationTask();
        resetEvaluationTask();
        setCompleteEvaluationTask(null);
    });

    const handleSubmitEvaluationTask = useMemo(() => (event, evaluatorId) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const payloadData = {};
        for (const key of data.keys()) {
            payloadData[key] = data.get(key);
        }

        patchEvaluationTask(
            `/evaluators/${evaluatorId}`,
            {
                preserveScroll: true,
                only: ['pendingTasksAsEvaluator'],
                onSuccess: () => {
                    clearErrorsEvaluationTask();
                    resetEvaluationTask();
                    setCompleteEvaluationTask(null);
                }
            }
        );
    });

    const completeEvaluationTaskDialog = useMemo(() => (task) => {
        const {
            evaluatee,
            evaluation_schedule: evaluationSchedule,
            id: evaluatorId,
        } = task;

        return <EvaluationTask
            data={dataEvaluationTask}
            evaluatee={evaluatee}
            evaluationSchedule={evaluationSchedule}
            evaluatorId={evaluatorId}
            errors={errorsPatchEvaluationTask}
            onClose={handleCloseCompleteEvaluationTask}
            onSubmit={handleSubmitEvaluationTask}
            setData={setDataEvaluationTask} />;
    });

    const MyTasksCard = <Card variant='outlined'>
        <CardContent>
            <Stack alignItems='center' direction='row' marginBottom={2} spacing={2}>
                <Badge badgeContent={pendingTasksAsEvaluator.data.length} color='primary'>
                    <Assignment />
                </Badge>
                <Typography variant='h5'>My Tasks</Typography>
            </Stack>
            {pendingTasksAsEvaluator.data.length > 0 ? <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Evaluation Schedule</TableCell>
                            <TableCell>Evaluation Type</TableCell>
                            <TableCell>Evaluatee</TableCell>
                            <TableCell></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {pendingTasksAsEvaluator.data.map((task) => <TableRow key={task.id}>
                            <TableCell>{task.evaluation_schedule.semester} A.Y. {task.evaluation_schedule.academic_year}</TableCell>
                            <TableCell>{task.evaluation_schedule.evaluation_type.title}</TableCell>
                            <TableCell>{task.evaluatee.last_name}, {task.evaluatee.first_name}</TableCell>
                            <TableCell>
                                <Button onClick={(event) => handleCompleteEvaluationTask(event, task)} variant='contained'>Complete Evaluation</Button>
                            </TableCell>
                        </TableRow>)}
                    </TableBody>
                </Table>
            </TableContainer>
                : <Typography variant='caption'>No pending evaluation as of the moment.</Typography>}
        </CardContent>
    </Card>;

    return <>
        {includes(roles, 'Evaluation Manager') && <Grid container gutter={2} marginBottom={2} spacing={2}>
            <Grid item md={12}>
                <EvaluationStatus />
            </Grid>
            <Grid item md={12}>
                <Paper sx={{ p: 2 }}>
                    <Typography textAlign="center" variant="h4">
                        General Stats
                    </Typography>
                    <Divider sx={{ m: 2 }} />
                    <Grid container gutter={2} spacing={2}>
                        <Grid item xl={6} lg={6} md={12} sm={12} xs={12}>
                            <UsersByGender />
                        </Grid>
                        <Grid item xl={6} lg={6} md={12} sm={12} xs={12}>
                            <FacultyByDepartment />
                        </Grid>
                    </Grid>
                </Paper>
            </Grid>
        </Grid>}
        {MyTasksCard}
        {completeEvaluationTask && completeEvaluationTaskDialog(completeEvaluationTask)}
    </>;
};

Index.layout = page => <MainLayout children={page} title="Dashboard" />;

export default Index;