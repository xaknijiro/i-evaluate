import _ from 'lodash';
import MainLayout from "../../MainLayout";
import { Badge, Button, Card, CardActions, CardContent, Grid, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import React, { useMemo, useState } from 'react';
import { Assignment, Grading, Group, PlayArrow, Queue } from '@mui/icons-material';
import { router, useForm } from '@inertiajs/react';
import EvaluationTask from '../../Components/EvaluationTask';

const Index = ({ latestEvaluationSchedule, pendingTasksAsEvaluator }) => {
    const [completeEvaluationTask, setCompleteEvaluationTask] = useState(null);

    const {
        academic_year: academicYear,
        evaluatees,
        semester,
        subject_classes_count_open: subjectClassesCountOpen,
        subject_classes_count_closed: subjectClassesCountClosed,
    } = latestEvaluationSchedule || {};

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

    const LatestEvaluationScheduleCard = latestEvaluationSchedule && <Card sx={{ mb: 2 }} variant='outlined'>
        <CardContent>
            <Typography gutterBottom variant="h5">
                Open Evaluation Period
            </Typography>
            <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
                {semester.title} A.Y. {academicYear}
            </Typography>
            <Grid container spacing={2}>
                <Grid item md={4}>
                    <Paper>
                        <Stack alignItems="center">
                            <Group sx={{ fontSize: 100 }} />
                            <Typography variant='h3'>
                                {evaluatees.length}
                            </Typography>
                            <Typography>Instructors</Typography>
                        </Stack>
                    </Paper>
                </Grid>
                <Grid item md={4}>
                    <Paper>
                        <Stack alignItems="center">
                            <Queue sx={{ fontSize: 100 }} />
                            <Typography variant='h3'>
                                {subjectClassesCountOpen}
                            </Typography>
                            <Typography>Open Subject Classes</Typography>
                        </Stack>
                    </Paper>
                </Grid>
                <Grid item md={4}>
                    <Paper>
                        <Stack alignItems="center">
                            <Grading sx={{ fontSize: 100 }} />
                            <Typography variant='h3'>
                                {subjectClassesCountClosed}
                            </Typography>
                            <Typography>Closed Subject Classes</Typography>
                        </Stack>
                    </Paper>
                </Grid>
            </Grid>

        </CardContent>
        <CardActions>
            <Button
                fullWidth
                onClick={() => router.get(`/evaluation-schedules/${latestEvaluationSchedule.id}/evaluatees`)}
                size="large"
                startIcon={<PlayArrow />}
                variant="contained"
            >Continue</Button>
        </CardActions>
    </Card>;


    const MyTasksCard = <Card variant='outlined'>
        <CardContent>
            <Stack alignItems='center' direction='row' marginBottom={2} spacing={2}>
                <Badge badgeContent={pendingTasksAsEvaluator.data.length} color='primary'>
                    <Assignment/>
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
        {LatestEvaluationScheduleCard}
        {MyTasksCard}
        {completeEvaluationTask && completeEvaluationTaskDialog(completeEvaluationTask)}
    </>;
};

Index.layout = page => <MainLayout children={page} title="Dashboard" />;

export default Index;