import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import MainLayout from "../../MainLayout";
import { Avatar, Box, Card, CardContent, CardHeader, Chip, Divider, Grid, IconButton, Paper, Stack, Typography } from "@mui/material";
import { AccountCircle, Lock, LockOpen, Password, School, Subject } from "@mui/icons-material";
import React from 'react';
import { Head, router } from "@inertiajs/react";
import { Gauge, gaugeClasses } from "@mui/x-charts";

const Index = ({ latestEvaluationSchedule }) => {
    return (
        <>
            <Head>
                <title>Dashboard</title>
            </Head>
            {latestEvaluationSchedule && <Card>
                <CardContent>
                    <Typography variant="h5">Latest Evaluation Schedule</Typography>
                    <Typography variant="caption">
                        {latestEvaluationSchedule.academic_year} {latestEvaluationSchedule.semester.title}
                    </Typography>
                    <Gauge
                        value={latestEvaluationSchedule.subject_classes_count_closed}
                        valueMax={latestEvaluationSchedule.subject_classes_count}
                        startAngle={-110}
                        endAngle={110}
                        sx={{
                            [`& .${gaugeClasses.valueText}`]: {
                                fontSize: 40,
                                transform: 'translate(0px, 0px)',
                            },
                        }}
                        text={
                            ({ value, valueMax }) => `${value} / ${valueMax}`
                        }
                        height={200}
                    />
                    <Grid container spacing={2}>
                        {latestEvaluationSchedule.subject_classes.map((subjectClass) => <Grid item md={6}>
                            <Paper
                                sx={{
                                    padding: 2,
                                }}
                            >
                                <Stack direction="row" spacing={2} alignItems="center" marginBottom={2}>
                                    <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                                        <AccountCircle />
                                    </Avatar>
                                    <Typography component="h1" variant="h5">
                                        {subjectClass.assigned_to.name}
                                    </Typography>
                                </Stack>
                                <Divider sx={{ marginBottom: 2 }}/>
                                <Chip icon={<Password />} label={subjectClass.pivot.code} color="success" sx={{ marginRight: 1 }} />
                                <Chip icon={<Subject />} label={`${subjectClass.subject.code} - ${subjectClass.subject.title}`} color="primary" sx={{ marginRight: 1 }} />
                                <Chip icon={<School />} label={`(${subjectClass.course.code} - ${subjectClass.year_level})`} color="secondary" sx={{ marginRight: 1 }} />
                                {latestEvaluationSchedule.evaluation_schedule_subject_classes
                                    .filter((evaluation_schedule_subject_class) => evaluation_schedule_subject_class.id === subjectClass.pivot.id)
                                    .map((evaluation_schedule_subject_class) => <Gauge
                                        value={evaluation_schedule_subject_class.respondents_submitted_count}
                                        valueMax={evaluation_schedule_subject_class.respondents_count}
                                        startAngle={-110}
                                        endAngle={110}
                                        sx={{
                                            [`& .${gaugeClasses.valueText}`]: {
                                                fontSize: 40,
                                                transform: 'translate(0px, 0px)',
                                            },
                                        }}
                                        text={
                                            ({ value, valueMax }) => `${value} / ${valueMax}`
                                        }
                                        height={150}
                                    />)}
                            </Paper>
                        </Grid>)}
                    </Grid>
                </CardContent>
            </Card>}
        </>
    );
};

Index.layout = page => <MainLayout children={page} title="Dashboard" />;

export default Index;