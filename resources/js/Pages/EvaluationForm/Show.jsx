import { router } from "@inertiajs/react";
import { Accordion, AccordionDetails, AccordionSummary, Box, Button, ButtonGroup, Divider, Grid, IconButton, Stack, TextField, Typography } from "@mui/material";
import MainLayout from "../../MainLayout";
import { AddTwoTone, DeleteForeverTwoTone, RemoveTwoTone } from "@mui/icons-material";
import React from "react";

const Show = ({ errors, evaluationForm }) => {
    const initialCriteriaIndicators = {};
    evaluationForm.criteria.forEach((criterion) => {
        initialCriteriaIndicators[`criterion_${criterion.id}`] = criterion.indicators.length > 0
            ? criterion.indicators.map((indicator) => indicator.description)
            : [""];
    });
    const [criteriaIndicators, setCriteriaIndicators] = React.useState(initialCriteriaIndicators);

    const deleteCriterion = (criterionId) => (e) => {
        e.stopPropagation();
        router.delete(`/evaluation-forms/${evaluationForm.id}/criteria/${criterionId}`);
    };

    const handleChangeCriterionIndicator = (criterionId, index) => (e) => {
        const updatedCriterionIndicators = criteriaIndicators;
        updatedCriterionIndicators[`criterion_${criterionId}`][index] = e.target.value;
        const indicators = { ...criteriaIndicators, ...updatedCriterionIndicators };
        setCriteriaIndicators(indicators);

    };

    const addCriterionIndicator = (criterionId, index) => () => {
        const updatedCriterionIndicators = criteriaIndicators;
        updatedCriterionIndicators[`criterion_${criterionId}`].splice(index + 1, 0, "");
        const indicators = { ...criteriaIndicators, ...updatedCriterionIndicators };
        setCriteriaIndicators(indicators);
    };

    const deleteCriterionIndicator = (criterionId, index) => () => {
        const updatedCriterionIndicators = criteriaIndicators;
        updatedCriterionIndicators[`criterion_${criterionId}`].splice(index, 1);
        const indicators = { ...criteriaIndicators, ...updatedCriterionIndicators };
        setCriteriaIndicators(indicators);
    };

    const handleSaveEvaluationForm = () => {
        evaluationForm.criteria.forEach((criterion) => {
            router.patch(
                `/evaluation-forms/${evaluationForm.id}/criteria/${criterion.id}`,
                {
                    description: criterion.description,
                    weight: criterion.weight,
                    indicators: criteriaIndicators[`criterion_${criterion.id}`].map((indicator) => (
                        {
                            description: indicator
                        }
                    ))
                }
            );
        });
    };

    return <>
        <Typography>
            <h1>{evaluationForm.title}</h1>
        </Typography>
        {criteriaIndicators && evaluationForm.criteria.map((criterion) => (
            <>
                <Accordion>
                    <AccordionSummary>
                        <Typography sx={{ flex: 1 }} variant="h5">
                            {criterion.description}
                        </Typography>
                        <ButtonGroup>
                            <IconButton onClick={deleteCriterion(criterion.id)}>
                                <DeleteForeverTwoTone />
                            </IconButton>
                        </ButtonGroup>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Stack spacing={2}>
                            {criteriaIndicators[`criterion_${criterion.id}`].map((description, index) => (
                                <>
                                    <Box>
                                        <Grid container>
                                            <Grid item md={11}>
                                                <TextField
                                                    defaultValue={description}
                                                    onChange={handleChangeCriterionIndicator(criterion.id, index)}
                                                    rows={2}
                                                    value={description}
                                                    variant="outlined"
                                                    multiline
                                                    fullWidth />
                                            </Grid>
                                            <Grid item md={1}>
                                                <ButtonGroup variant="text">
                                                    <IconButton>
                                                        <AddTwoTone onClick={addCriterionIndicator(criterion.id, index)} />
                                                    </IconButton>
                                                    {(index > 0) && <IconButton>
                                                        <RemoveTwoTone onClick={deleteCriterionIndicator(criterion.id, index)} />
                                                    </IconButton>}
                                                </ButtonGroup>
                                            </Grid>
                                            <Divider />
                                        </Grid>
                                    </Box>
                                </>
                            ))}
                        </Stack>
                    </AccordionDetails>
                </Accordion>
            </>
        )
        )}

        <Box sx={{ display: "flex", flexDirection: "row-reverse", mt: 2 }}>
            {Boolean(evaluationForm.published) ? <ButtonGroup variant="contained">
                <Button>Archive</Button>
            </ButtonGroup> : <ButtonGroup variant="contained">
                <Button color="secondary" onClick={handleSaveEvaluationForm}>Save</Button>
                <Button>Publish</Button>
            </ButtonGroup>}
        </Box>
    </>;
};

Show.layout = page => <MainLayout children={page} title="Evaluation Form" />;

export default Show;