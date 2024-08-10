import { ThemeProvider } from "@emotion/react";
import { Head, router, usePage } from "@inertiajs/react";
import { AccountCircle, Apartment, AssessmentTwoTone, CalendarMonthTwoTone, DashboardTwoTone, Description, ExpandLess, ExpandMore, FolderTwoTone, InfoTwoTone, ListAlt, Logout, Menu, Password, People, School, Settings, SettingsTwoTone } from "@mui/icons-material";
import { Alert, AppBar, Avatar, Box, Collapse, createTheme, Divider, Drawer, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Paper, Snackbar, Toolbar, Typography } from "@mui/material";
import React from 'react';
import { includes } from 'lodash';

const MainLayout = ({ children, title }) => {

    const theme = createTheme({
        palette: {
            mode: 'light',
            primary: {
                main: '#960e21',
            },
            secondary: {
                main: '#f50057',
            },
        },
    });

    const { auth, flashMessage } = usePage().props;
    const { roles } = auth;
    const { email, name } = auth;
    const [openAppDrawer, setOpenAppDrawer] = React.useState(false);
    const [openUserDrawer, setOpenUserDrawer] = React.useState(false);
    const [openFlashMessage, setOpenFlashMessage] = React.useState(true);
    
    const handleCloseFlashMessage = (_event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpenFlashMessage(false);
    };

    const toggleAppDrawer = (newOpenAppDrawer) => () => {
        setOpenAppDrawer(newOpenAppDrawer);
    };

    const toggleUserDrawer = (newOpenUserDrawer) => () => {
        setOpenUserDrawer(newOpenUserDrawer);
    };

    const [openSettings, setOpenSettings] = React.useState(false);
    const toggleSettings = (event) => {
        event.stopPropagation();
        setOpenSettings(!openSettings);
    };

    const routeToPage = (url) => () => {
        router.get(`/${url ?? ''}`);
    };

    const logout = () => {
        router.post('/logout');
    };

    const AppMenu = (
        <Box sx={{ width: 300 }} role="presentation" onClick={toggleAppDrawer(false)}>
            <img
                src="/images/logo-kcp-emblem.png"
                alt="KCP"
                height={180}
                style={{ margin: 'auto', display: 'block' }}
            />
            <List>
                <ListItem disablePadding>
                    <ListItemButton onClick={routeToPage()}>
                        <ListItemIcon>
                            <DashboardTwoTone />
                        </ListItemIcon>
                        <ListItemText primary="Dashboard" />
                    </ListItemButton>
                </ListItem>
            </List>
            <Divider />
            <List>
                <ListItem disablePadding>
                    <ListItemButton onClick={routeToPage('evaluation-schedules')}>
                        <ListItemIcon>
                            <CalendarMonthTwoTone />
                        </ListItemIcon>
                        <ListItemText primary="Evaluation Schedule" />
                    </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                    <ListItemButton>
                        <ListItemIcon>
                            <AssessmentTwoTone />
                        </ListItemIcon>
                        <ListItemText primary="Generate Report" />
                    </ListItemButton>
                </ListItem>
            </List>
            <Divider />

            {includes(roles, 'Evaluation Manager') && <>
                <List>
                    <ListItem disablePadding>
                        <ListItemButton onClick={toggleSettings}>
                            <ListItemIcon>
                                <SettingsTwoTone />
                            </ListItemIcon>
                            <ListItemText primary="General Settings" />
                            {openSettings ? <ExpandLess /> : <ExpandMore />}
                        </ListItemButton>
                    </ListItem>
                    <Collapse in={openSettings} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                            <ListItem disablePadding>
                                <ListItemButton onClick={routeToPage('evaluation-forms')} sx={{ pl: 6 }}>
                                    <ListItemIcon>
                                        <FolderTwoTone />
                                    </ListItemIcon>
                                    <ListItemText primary="Evaluation Forms" />
                                </ListItemButton>
                            </ListItem>
                            <ListItem disablePadding>
                                <ListItemButton onClick={routeToPage('departments')} sx={{ pl: 6 }}>
                                    <ListItemIcon>
                                        <Apartment />
                                    </ListItemIcon>
                                    <ListItemText primary="Departments Regitry" />
                                </ListItemButton>
                            </ListItem>
                            <ListItem disablePadding>
                                <ListItemButton onClick={routeToPage('courses')} sx={{ pl: 6 }}>
                                    <ListItemIcon>
                                        <School />
                                    </ListItemIcon>
                                    <ListItemText primary="Courses Registry" />
                                </ListItemButton>
                            </ListItem>
                            <ListItem disablePadding>
                                <ListItemButton onClick={routeToPage('subjects')} sx={{ pl: 6 }}>
                                    <ListItemIcon>
                                        <ListAlt />
                                    </ListItemIcon>
                                    <ListItemText primary="Subjects Registry" />
                                </ListItemButton>
                            </ListItem>
                            <ListItem disablePadding>
                                <ListItemButton onClick={routeToPage('users')} sx={{ pl: 6 }}>
                                    <ListItemIcon>
                                        <People />
                                    </ListItemIcon>
                                    <ListItemText primary="Users Registry" />
                                </ListItemButton>
                            </ListItem>
                        </List>
                    </Collapse>
                </List>
                <Divider />
            </>}

            <List>
                <ListItem disablePadding>
                    <ListItemButton onClick={routeToPage('about')}>
                        <ListItemIcon>
                            <InfoTwoTone />
                        </ListItemIcon>
                        <ListItemText primary="About" />
                    </ListItemButton>
                </ListItem>
            </List>
        </Box>
    );

    const UserMenu = (
        <Box sx={{ width: 250 }} role="presentation" onClick={toggleUserDrawer(false)}>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                    <AccountCircle />
                </Avatar>
                <Typography variant="h5">{name}</Typography>
                <Typography variant="caption">{email}</Typography>
            </Box>
            <List>
                <ListItem disablePadding>
                    <ListItemButton onClick={routeToPage()}>
                        <ListItemIcon>
                            <Description />
                        </ListItemIcon>
                        <ListItemText primary="My Profile" />
                    </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                    <ListItemButton onClick={logout}>
                        <ListItemIcon>
                            <Logout />
                        </ListItemIcon>
                        <ListItemText primary="Logout" />
                    </ListItemButton>
                </ListItem>
            </List>
        </Box>
    );

    return <ThemeProvider theme={theme}>
        <Head>
            <title>{title}</title>
            <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        </Head>
        <Box sx={{ flexGrow: 1 }}>
            <React.Fragment>
                <AppBar position="fixed">
                    <Toolbar>
                        <IconButton
                            size="large"
                            edge="start"
                            color="inherit"
                            aria-label="menu"
                            sx={{ mr: 2 }}
                            onClick={toggleAppDrawer(true)}
                        >
                            <Menu />
                        </IconButton>
                        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                            I-Evaluate | {title}
                        </Typography>
                        <IconButton
                            size="large"
                            edge="start"
                            color="inherit"
                            aria-label="menu"
                            sx={{ mr: 2 }}
                            onClick={toggleUserDrawer(true)}
                        >
                            <AccountCircle />
                        </IconButton>
                    </Toolbar>
                </AppBar>
                <Toolbar />
            </React.Fragment>
        </Box>

        <Drawer anchor="left" open={openAppDrawer} onClose={toggleAppDrawer(false)}>
            {AppMenu}
        </Drawer>

        <Drawer anchor="right" open={openUserDrawer} onClose={toggleUserDrawer(false)}>
            {UserMenu}
        </Drawer>

        <Snackbar
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
            autoHideDuration={3000}
            onClose={handleCloseFlashMessage}
            open={!!flashMessage && openFlashMessage}
        >
            <Alert
                onClose={handleCloseFlashMessage}
                severity={flashMessage?.severity}
                sx={{ width: '100%' }}
                variant="filled"
            >
                {flashMessage?.value}
            </Alert>
        </Snackbar>

        <Paper
            elevation={3}
            maxWidth={false}
            sx={{ p: 2, m: 2 }}>{children}</Paper>
    </ThemeProvider>;
};

export default MainLayout;