import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { SentenceNode } from '../utils/textSummarization';

interface SentenceGraphProps {
  nodes: SentenceNode[];
  width?: number;
  height?: number;
}

const SentenceGraph: React.FC<SentenceGraphProps> = ({ 
  nodes, 
  width = 600, 
  height = 400 
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Create links from node connections
    const links = nodes.flatMap(node => 
      node.connections.map(conn => ({
        source: node.id,
        target: conn.target,
        weight: conn.weight
      }))
    );

    // Set up force simulation
    const simulation = d3.forceSimulation(nodes as any)
      .force('link', d3.forceLink(links).id((d: any) => d.id).strength(0.1))
      .force('charge', d3.forceManyBody().strength(-50))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide(30));

    // Create link elements
    const link = svg.append('g')
      .selectAll('line')
      .data(links)
      .enter().append('line')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', (d: any) => Math.sqrt(d.weight * 5));

    // Create node elements
    const node = svg.append('g')
      .selectAll('circle')
      .data(nodes)
      .enter().append('circle')
      .attr('r', (d: any) => 5 + d.score * 15)
      .attr('fill', (d: any) => {
        if (d.sentiment > 0.1) return '#10B981'; // Positive - green
        if (d.sentiment < -0.1) return '#EF4444'; // Negative - red
        return '#6B7280'; // Neutral - gray
      })
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer');

    // Add text labels
    const text = svg.append('g')
      .selectAll('text')
      .data(nodes)
      .enter().append('text')
      .text((d: any) => d.text.split(' ').slice(0, 3).join(' ') + '...')
      .attr('font-size', '10px')
      .attr('font-family', 'inherit')
      .attr('fill', '#374151')
      .attr('text-anchor', 'middle')
      .attr('dy', '.35em')
      .style('pointer-events', 'none');

    // Add tooltips
    const tooltip = d3.select('body').append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0)
      .style('position', 'absolute')
      .style('background', 'rgba(0, 0, 0, 0.8)')
      .style('color', 'white')
      .style('border-radius', '4px')
      .style('padding', '8px')
      .style('font-size', '12px')
      .style('pointer-events', 'none')
      .style('z-index', '1000');

    node
      .on('mouseover', function(event: any, d: any) {
        tooltip.transition()
          .duration(200)
          .style('opacity', .9);
        tooltip.html(`
          <strong>Score:</strong> ${d.score.toFixed(3)}<br/>
          <strong>Sentiment:</strong> ${d.sentiment.toFixed(3)}<br/>
          <strong>Text:</strong> ${d.text}
        `)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', function() {
        tooltip.transition()
          .duration(500)
          .style('opacity', 0);
      });

    // Update positions on simulation tick
    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node
        .attr('cx', (d: any) => d.x)
        .attr('cy', (d: any) => d.y);

      text
        .attr('x', (d: any) => d.x)
        .attr('y', (d: any) => d.y + 25);
    });

    // Cleanup function
    return () => {
      simulation.stop();
      tooltip.remove();
    };
  }, [nodes, width, height]);

  return (
    <div className="bg-white p-4 rounded-lg border border-grey-200">
      <h4 className="text-sm font-semibold text-grey-800 mb-3">Sentence Relationships</h4>
      <div className="flex items-center space-x-4 text-xs text-grey-600 mb-3">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
          Positive sentiment
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
          Negative sentiment
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-gray-500 mr-1"></div>
          Neutral sentiment
        </div>
      </div>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="border border-grey-100 rounded"
      />
      <p className="text-xs text-grey-500 mt-2">
        Circle size = importance score • Lines = sentence similarity • Hover for details<br/>
        <span className="text-grey-400">Showing top 25 most important sentences for performance</span>
      </p>
    </div>
  );
};

export default SentenceGraph;