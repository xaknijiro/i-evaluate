import Container from '@mui/material/Container';
import { Accordion, AccordionDetails, AccordionSummary, AppBar, Box, Chip, Dialog, Divider, Grid, IconButton, Paper, Rating, Stack, Table, TableBody, TableCell, TableContainer, TableFooter, TableHead, TableRow, Toolbar, Typography } from '@mui/material';
import { Apartment, CardMembership, Close, Email, PersonPin } from '@mui/icons-material';
import { find } from 'lodash';

export default function EvaluationResultDialog({
    evaluationSchedule,
    evaluatee,
    likertScaleLegend,
    onClose,
    roles,
}) {
    const {
        academic_year: academicYear,
        evaluation_type: evaluationType,
        evaluation_form: evaluationForm,
        semester
    } = evaluationSchedule;

    const { likert_scale: likertScale } = evaluationForm || {};
    const { default_options: options } = likertScale || {};

    console.log(evaluatee);
    
    const {
        department: evaluateeDepartment,
        email: evaluateeEmail,
        evaluation,
        first_name: evaluateeFirstName,
        institution_id: evaluateeInstitutionId,
        last_name: evaluateeLastName,
    } = evaluatee;
    const evaluateeFullName = `${evaluateeLastName}, ${evaluateeFirstName}`;
    const {
        evaluators: evaluateeEvaluators,
        is_open: evaluateeEvaluationIsOpen,
        result: evaluationResultDetails,
    } = evaluation;

    return <Dialog
        maxWidth="lg"
        open
        onClose={onClose}
        PaperProps={{
            component: 'form',
            onSubmit: (event) => {
                event.preventDefault();
            },
        }}
        fullScreen
    >
        <AppBar sx={{ position: 'fixed' }}>
            <Toolbar>
                <IconButton
                    edge="start"
                    color="inherit"
                    onClick={onClose}
                    aria-label="close"
                >
                    <Close />
                </IconButton>
                <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
                    {evaluationType.title} Result
                </Typography>
            </Toolbar>
        </AppBar>
        <Container sx={{ mt: 12, mb: 4 }}>
            <Box sx={{ p: 2 }}>
                <Typography
                    variant="h4"
                    textAlign="center"

                >
                    {evaluationType.title} Result
                </Typography>
                <Typography
                    gutterBottom
                    variant="subtitle1"
                    textAlign="center"
                >
                    {semester} A.Y. {academicYear}
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Grid container spacing={1}>
                    <Grid item md={6}>
                        <Paper variant="outlined" sx={{ mb: 2, p: 2 }}>
                            <Stack direction="row" spacing={1} alignItems="center" marginBottom={2}>
                                <PersonPin />
                                <Typography variant="h5" display="inline">{evaluateeFullName}</Typography>
                            </Stack>
                            <Stack spacing={1}>
                                <Chip color="primary" icon={<CardMembership />} label={evaluateeInstitutionId} />
                                <Chip color="default" icon={<Apartment />} label={evaluateeDepartment?.title} />
                                <Chip color="default" icon={<Email />} label={evaluateeEmail} />
                            </Stack>
                        </Paper>
                    </Grid>
                </Grid>

                <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
                    <Table size="small">
                        <caption style={{ captionSide: "top", textAlign: "center" }}>
                            {evaluationType.title} Result Summary
                            <Divider sx={{ my: 1 }} />
                        </caption>
                        <TableHead>
                            <TableRow>
                                <TableCell>Criterion</TableCell>
                                <TableCell align="center">Rating</TableCell>
                                <TableCell align="center">Weight</TableCell>
                                <TableCell align="center">Weighted Rating</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {evaluationForm.criteria.filter((criterion) => criterion.is_weighted).map((criterion) => {
                                const { details } = evaluationResultDetails || {};
                                const { criteria } = details || [];
                                const criterionResult = find(criteria, { id: criterion.id });
                                return <TableRow key={criterion.id}>
                                    <TableCell width="60%">{criterion.description}</TableCell>
                                    <TableCell align="center">{criterionResult?.rating.toFixed(2) || 0}</TableCell>
                                    <TableCell align="center">{criterion.weight * 100}%</TableCell>
                                    <TableCell align="center">{criterionResult?.weighted_rating.toFixed(2) || 0}</TableCell>
                                </TableRow>;
                            })}
                        </TableBody>
                        <TableFooter>
                            <TableRow>
                                <TableCell align="right" colSpan={3}>Overall Rating</TableCell>
                                <TableCell align="center">
                                    {evaluationResultDetails?.details?.overall_rating.toFixed(2) || 0} ({evaluationResultDetails?.details?.percentile_equivalent || 0}%)
                                    ({evaluationResultDetails?.details?.descriptive_equivalent || ''})<br />
                                    <Rating
                                        precision={0.1}
                                        value={evaluationResultDetails?.details?.overall_rating.toFixed(2) || 0}
                                        size="small"
                                        readOnly />
                                </TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                </TableContainer>

                <Box sx={{ mb: 2 }}>{likertScaleLegend()}</Box>

                {evaluationForm.criteria.filter((criterion) => !criterion.is_weighted).map((criterion) => {
                    const { details } = evaluationResultDetails || {};
                    const { criteria } = details || [];
                    const criterionResult = find(criteria, { id: criterion.id });

                    return <Accordion expanded key={criterion.id} variant="outlined">
                        <AccordionSummary>
                            <Typography flex={1} variant="h6">{criterion.description}</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            {criterion.indicators.map((indicator, index) => {
                                const { indicators: indicatorsResult } = criterionResult || {};
                                const indicatorResult = find(indicatorsResult, { id: indicator.id });
                                const { tally } = indicatorResult || [];
                                const { comments } = tally[0] || [];

                                return <Box key={indicator.id} sx={{ mb: 2 }}>
                                    <Typography sx={{ mb: 2 }}>{index + 1}. {indicator.description}</Typography>
                                    <Typography><div style={{ whiteSpace: 'pre-wrap' }} dangerouslySetInnerHTML={{ __html: comments }}></div></Typography>
                                </Box>;
                            })}
                        </AccordionDetails>
                    </Accordion>;
                })}
                
            </Box>
        </Container>
    </Dialog>;
}