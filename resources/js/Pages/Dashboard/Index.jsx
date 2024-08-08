import _ from 'lodash';
import MainLayout from "../../MainLayout";
import { Accordion, AccordionDetails, AccordionSummary, Button, Typography } from "@mui/material";
import { AccountCircle, Calculate, ExpandMore, HourglassEmpty } from "@mui/icons-material";
import React from 'react';
import { Head, router } from "@inertiajs/react";
import { DataGrid } from '@mui/x-data-grid';

const Index = ({ latestEvaluationSchedule }) => {
    const {
        evaluatees,
        subject_classes: subjectClasses,
        evaluation_schedule_subject_classes: evaluationScheduleSubjectClasses
    } = latestEvaluationSchedule || {};
    const subjectClassesGroupByEvaluatee = _.groupBy(subjectClasses, 'assigned_to.id');
    const subjectClassesEvaluationDetails = _.keyBy(evaluationScheduleSubjectClasses, 'code');

    console.log(subjectClassesGroupByEvaluatee);
    console.log(subjectClassesEvaluationDetails);

    const handleCalculateResult = (e, evaluationScheduleSubjectClassId) => {
        e.preventDefault();
        router.post(
            `/calculate-evaluation-result/${evaluationScheduleSubjectClassId}`,
            {},
            {
                preserveScroll: true,
                preserveState: false,
            }
        );
    };

    const columns = [
        {
            field: 'code',
            headerName: 'Evaluation Code',
            width: 150,
            valueGetter: (cell) => {
                return `${cell.row.pivot.code}`;
            },
        },
        {
            field: 'subject',
            headerName: 'Subject',
            flex: 1,
            valueGetter: (cell) => {
                return `${cell.value.code} - ${cell.value.title}`;
            },
        },
        {
            field: 'course',
            width: 150,
            headerName: 'Course',
            valueGetter: (cell) => {
                return `${cell.value.code}`;
            },
        },
        {
            field: 'year_level',
            width: 100,
            headerName: 'Year Level',
        },
        {
            field: 'respondents_submitted_count',
            headerName: 'Respondents Submitted',
            width: 100,
            renderCell: (cell) => {
                const evaluationDetails = subjectClassesEvaluationDetails[cell.row.pivot.code];
                return evaluationDetails?.respondents_submitted_count || 0;
            },
        },
        {
            field: 'respondents_registered_count',
            headerName: 'Respondents Registered',
            width: 100,
            renderCell: (cell) => {
                const evaluationDetails = subjectClassesEvaluationDetails[cell.row.pivot.code];
                return evaluationDetails?.respondents_count || 0;
            },
        },
        {
            field: 'overall_score',
            headerName: 'Overall Score',
            flex: 1,
            renderCell: (cell) => {
                const evaluationDetails = subjectClassesEvaluationDetails[cell.row.pivot.code];
                const { evaluation_result: evaluationResult } = evaluationDetails;
                const isClosed = !evaluationDetails?.is_open || false;

                if (!isClosed && (evaluationDetails?.respondents_count || 0) === 0) {
                    return <Button
                        disabled
                        startIcon={<HourglassEmpty />}
                        variant="outlined"
                    >
                        In Progress
                    </Button>;
                }

                return isClosed && !_.isNull(evaluationResult)
                    ? `${evaluationResult.details.overall_score}%`
                    : <Button
                        onClick={(e) => handleCalculateResult(e, cell.row.pivot.id)}
                        startIcon={<Calculate />}
                        variant="contained"
                    >
                        Calculate Result
                    </Button>;
            },
        },
    ];

    return (
        <>
            <Head>
                <title>Dashboard</title>
            </Head>
            {evaluatees && evaluatees.map((evaluatee) => <Accordion>
                <AccordionSummary
                    expandIcon={<ExpandMore />}
                >
                    <AccountCircle />
                    <Typography>{evaluatee.name}</Typography>
                    <Typography>
                        Scheduled Subject Classes: {subjectClassesGroupByEvaluatee[evaluatee.id].length}
                    </Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <DataGrid
                        autoHeight
                        columns={columns}
                        rows={subjectClassesGroupByEvaluatee[evaluatee.id]}
                    />
                </AccordionDetails>
            </Accordion>)}
        </>
    );
};

Index.layout = page => <MainLayout children={page} title="Dashboard" />;

export default Index;