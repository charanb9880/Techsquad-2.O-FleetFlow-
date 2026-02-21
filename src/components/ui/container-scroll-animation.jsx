"use client";
import React, { useRef } from "react";
import { useScroll, useTransform, motion } from "framer-motion";

export const ContainerScroll = ({
    titleComponent,
    children,
}) => {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
    });
    const [isMobile, setIsMobile] = React.useState(false);

    React.useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => {
            window.removeEventListener("resize", checkMobile);
        };
    }, []);

    const scaleDimensions = () => {
        return isMobile ? [0.7, 0.9] : [1.05, 1];
    };

    const rotate = useTransform(scrollYProgress, [0, 1], [20, 0]);
    const scale = useTransform(scrollYProgress, [0, 1], scaleDimensions());
    const translate = useTransform(scrollYProgress, [0, 1], [0, -100]);

    return (
        <div
            className="h-[40rem] md:h-[60rem] flex items-center justify-center relative p-2 md:p-10 bg-transparent overflow-hidden"
            ref={containerRef}
        >
            <div
                className="py-10 md:py-20 w-full relative"
                style={{
                    perspective: "1000px",
                }}
            >
                <Header translate={translate} titleComponent={titleComponent} />
                <Card rotate={rotate} translate={translate} scale={scale}>
                    {children}
                </Card>
            </div>
        </div>
    );
};

export const Header = ({ translate, titleComponent }) => {
    return (
        <motion.div
            style={{
                translateY: translate,
            }}
            className="max-w-5xl mx-auto text-center"
        >
            {titleComponent}
        </motion.div>
    );
};

export const Card = ({
    rotate,
    scale,
    children,
}) => {
    return (
        <motion.div
            style={{
                rotateX: rotate,
                scale,
                boxShadow:
                    "0 0 #0000004d, 0 9px 20px #0000004a, 0 37px 37px #00000042, 0 84px 50px #00000026, 0 149px 60px #0000000a, 0 233px 65px #00000003",
            }}
            className="max-w-5xl -mt-12 mx-auto h-[25rem] md:h-[35rem] w-full border-4 border-[#333] p-2 md:p-4 bg-[#111] rounded-[30px] shadow-2xl"
        >
            <div className="h-full w-full overflow-hidden rounded-2xl bg-[#0a0a0a] border border-[#222] md:p-4">
                {children}
            </div>
        </motion.div>
    );
};
