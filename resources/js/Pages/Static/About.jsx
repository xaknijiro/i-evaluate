import MainLayout from "../../MainLayout";

const About = () => {
    return <>
        <h1>About...</h1>
    </>;
};

About.layout = page => <MainLayout children={page} title="About"/>;

export default About;