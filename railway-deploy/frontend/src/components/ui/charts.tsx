'use client';

import { ResponsiveLine } from '@nivo/line';
import { ResponsiveBar } from '@nivo/bar';
import { ResponsivePie } from '@nivo/pie';

export function LineChart({ data }: { data: any[] }) {
    const formattedData = [
        {
            id: 'primary',
            data: data.map(d => ({
                x: d.month || d.x,
                y: d.revenue || d.count || d.y
            }))
        }
    ];

    return (
        <div style={{ height: '300px' }}>
            <ResponsiveLine
                data={formattedData}
                margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
                xScale={{ type: 'point' }}
                yScale={{
                    type: 'linear',
                    min: 'auto',
                    max: 'auto',
                    stacked: false,
                    reverse: false
                }}
                yFormat=" >-.2f"
                axisTop={null}
                axisRight={null}
                axisBottom={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 0
                }}
                axisLeft={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 0
                }}
                pointSize={10}
                pointColor={{ theme: 'background' }}
                pointBorderWidth={2}
                pointBorderColor={{ from: 'serieColor' }}
                pointLabelYOffset={-12}
                useMesh={true}
                legends={[
                    {
                        anchor: 'bottom-right',
                        direction: 'column',
                        justify: false,
                        translateX: 100,
                        translateY: 0,
                        itemsSpacing: 0,
                        itemDirection: 'left-to-right',
                        itemWidth: 80,
                        itemHeight: 20,
                        itemOpacity: 0.75,
                        symbolSize: 12,
                        symbolShape: 'circle',
                        symbolBorderColor: 'rgba(0, 0, 0, .5)'
                    }
                ]}
            />
        </div>
    );
}

export function BarChart({ data }: { data: any[] }) {
    const formattedData = data.map(d => ({
        category: d.category || d.type,
        value: d.amount || d.count
    }));

    return (
        <div style={{ height: '300px' }}>
            <ResponsiveBar
                data={formattedData}
                keys={['value']}
                indexBy="category"
                margin={{ top: 50, right: 50, bottom: 50, left: 60 }}
                padding={0.3}
                valueScale={{ type: 'linear' }}
                indexScale={{ type: 'band', round: true }}
                colors={{ scheme: 'nivo' }}
                borderColor={{
                    from: 'color',
                    modifiers: [['darker', 1.6]]
                }}
                axisTop={null}
                axisRight={null}
                axisBottom={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 0
                }}
                axisLeft={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 0
                }}
                labelSkipWidth={12}
                labelSkipHeight={12}
                labelTextColor={{
                    from: 'color',
                    modifiers: [['darker', 1.6]]
                }}
                animate={true}
                motionStiffness={90}
                motionDamping={15}
            />
        </div>
    );
}

export function PieChart({ data }: { data: any[] }) {
    const formattedData = data.map(d => ({
        id: d.name,
        label: d.name,
        value: d.value
    }));

    return (
        <div style={{ height: '300px' }}>
            <ResponsivePie
                data={formattedData}
                margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
                innerRadius={0.5}
                padAngle={0.7}
                cornerRadius={3}
                colors={{ scheme: 'nivo' }}
                borderWidth={1}
                borderColor={{
                    from: 'color',
                    modifiers: [['darker', 0.2]]
                }}
                radialLabelsSkipAngle={10}
                radialLabelsTextColor="#333333"
                radialLabelsLinkColor={{ from: 'color' }}
                sliceLabelsSkipAngle={10}
                sliceLabelsTextColor="#333333"
            />
        </div>
    );
}