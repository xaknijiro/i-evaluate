import _ from 'lodash';
import MainLayout from "../../MainLayout";
import { Button, Card, CardActions, CardContent, Grid, Link, Paper, Stack, Typography } from "@mui/material";
import React from 'react';
import { Grading, Group, PlayArrow, Queue, Subject } from '@mui/icons-material';
import { router } from '@inertiajs/react';

const Index = ({ latestEvaluationSchedule }) => {

    const {
        academic_year: academicYear,
        evaluatees,
        semester,
        subject_classes_count_open: subjectClassesCountOpen,
        subject_classes_count_closed: subjectClassesCountClosed,
    } = latestEvaluationSchedule || {};

    const LatestEvaluationScheduleCard = latestEvaluationSchedule && <Card variant='outlined'>
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


    return <>
        {LatestEvaluationScheduleCard}
    </>;
};

Index.layout = page => <MainLayout children={page} title="Dashboard" />;

export default Index;