import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { generateSensitivityAnalysis } from '../../engine/scenarios';
import { formatCurrency } from '../../engine/formatters';

export default function SensitivityTornado({ inputs }) {
  const d3Container = useRef(null);
  
  // Re-render when inputs change
  useEffect(() => {
    if (!inputs || !d3Container.current) return;
    
    const data = generateSensitivityAnalysis(inputs);
    if (!data || data.length === 0) return;
    
    // Clear previous chart
    d3.select(d3Container.current).selectAll('*').remove();
    
    // Setup dimensions
    const margin = { top: 30, right: 120, bottom: 40, left: 160 };
    const width = d3Container.current.clientWidth - margin.left - margin.right;
    const height = Math.max(400, data.length * 60);
    
    const svg = d3.select(d3Container.current)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
      
    // Find min and max across all variations to set X scale
    const allVals = data.flatMap(d => [d.minus20, d.plus20]);
    const minNPV = Math.min(...allVals);
    const maxNPV = Math.max(...allVals);
    
    const baseNPV = data[0].baseNPV;
    
    // X axis (NPV value)
    const x = d3.scaleLinear()
      .domain([minNPV * 0.9, maxNPV * 1.1])
      .range([0, width]);
      
    // Y axis (Variables)
    const y = d3.scaleBand()
      .domain(data.map(d => d.name))
      .range([0, height])
      .padding(0.4);
      
    // Add grid lines
    svg.append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x)
        .ticks(5)
        .tickSize(-height)
        .tickFormat('')
      )
      .attr('stroke-opacity', 0.1);
      
    // Add X axis
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x)
        .ticks(5)
        .tickFormat(d => formatCurrency(d, 0))
      )
      .selectAll('text')
      .style('fill', 'var(--text-muted)')
      .style('font-family', 'var(--font-mono)')
      .style('font-size', '12px');
      
    // Add Y axis
    svg.append('g')
      .call(d3.axisLeft(y))
      .selectAll('text')
      .style('fill', 'var(--text-primary)')
      .style('font-family', 'var(--font-body)')
      .style('font-weight', '500')
      .style('font-size', '13px');
      
    // Remove axis lines
    svg.selectAll('.domain, .tick line').attr('stroke', 'rgba(255,255,255,0.2)');
    
    // Base case vertical line
    svg.append('line')
      .attr('x1', x(baseNPV))
      .attr('y1', -10)
      .attr('x2', x(baseNPV))
      .attr('y2', height)
      .attr('stroke', 'var(--text-primary)')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '4 4');
      
    svg.append('text')
      .attr('x', x(baseNPV))
      .attr('y', -15)
      .attr('text-anchor', 'middle')
      .style('fill', 'var(--text-primary)')
      .style('font-size', '12px')
      .text('Base NPV');

    // Tooltip
    const tooltip = d3.select(d3Container.current)
      .append('div')
      .attr('class', 'absolute hidden bg-[var(--bg-elevated)] border border-[var(--glass-border)] rounded-md p-3 text-sm z-10 text-white shadow-xl pointer-events-none')
      .style('transform', 'translate(-50%, -100%)');

    // Draw bars
    const barGroups = svg.selectAll('.bar-group')
      .data(data)
      .enter()
      .append('g')
      .attr('class', 'bar-group')
      .attr('transform', d => `translate(0,${y(d.name)})`);
      
    // Negative variation bar (-20%)
    barGroups.append('rect')
      .attr('x', d => Math.min(x(d.minus20), x(baseNPV)))
      .attr('y', 0)
      .attr('height', y.bandwidth())
      .attr('width', d => Math.abs(x(baseNPV) - x(d.minus20)))
      .attr('fill', d => d.minus20 > baseNPV ? 'var(--accent-green)' : 'var(--accent-burgundy)')
      .attr('opacity', 0.8)
      .attr('rx', 4)
      .on('mouseover', function(event, d) {
        d3.select(this).attr('opacity', 1);
        tooltip.classed('hidden', false)
          .html(`<strong>-20% Change</strong><br/>NPV: ${formatCurrency(d.minus20)}<br/>Impact: ${formatCurrency(Math.abs(d.minus20 - baseNPV))}`);
      })
      .on('mousemove', function(event) {
        tooltip
          .style('left', (event.pageX) + 'px')
          .style('top', (event.pageY - 10) + 'px');
      })
      .on('mouseout', function() {
        d3.select(this).attr('opacity', 0.8);
        tooltip.classed('hidden', true);
      });
      
    // Positive variation bar (+20%)
    barGroups.append('rect')
      .attr('x', d => Math.min(x(d.plus20), x(baseNPV)))
      .attr('y', 0)
      .attr('height', y.bandwidth())
      .attr('width', d => Math.abs(x(d.plus20) - x(baseNPV)))
      .attr('fill', d => d.plus20 > baseNPV ? 'var(--accent-green)' : 'var(--accent-burgundy)')
      .attr('opacity', 0.8)
      .attr('rx', 4)
      .on('mouseover', function(event, d) {
        d3.select(this).attr('opacity', 1);
        tooltip.classed('hidden', false)
          .html(`<strong>+20% Change</strong><br/>NPV: ${formatCurrency(d.plus20)}<br/>Impact: ${formatCurrency(Math.abs(d.plus20 - baseNPV))}`);
      })
      .on('mousemove', function(event) {
        tooltip
          .style('left', (event.pageX) + 'px')
          .style('top', (event.pageY - 10) + 'px');
      })
      .on('mouseout', function() {
        d3.select(this).attr('opacity', 0.8);
        tooltip.classed('hidden', true);
      });
      
    // Add value labels to the ends of the bars
    barGroups.append('text')
      .attr('x', d => d.minus20 > baseNPV ? Math.max(x(d.minus20), x(d.plus20)) + 5 : Math.min(x(d.minus20), x(d.plus20)) - 5)
      .attr('y', y.bandwidth() / 2 + 4)
      .attr('text-anchor', d => d.minus20 > baseNPV ? 'start' : 'end')
      .style('fill', 'var(--text-muted)')
      .style('font-size', '11px')
      .style('font-family', 'var(--font-mono)')
      .text(d => formatCurrency(Math.min(d.minus20, d.plus20), 0));
      
    barGroups.append('text')
      .attr('x', d => d.plus20 > baseNPV ? Math.max(x(d.minus20), x(d.plus20)) + 5 : Math.min(x(d.minus20), x(d.plus20)) - 5)
      .attr('y', y.bandwidth() / 2 + 4)
      .attr('text-anchor', d => d.plus20 > baseNPV ? 'start' : 'end')
      .style('fill', 'var(--text-muted)')
      .style('font-size', '11px')
      .style('font-family', 'var(--font-mono)')
      .text(d => formatCurrency(Math.max(d.minus20, d.plus20), 0));

  }, [inputs]);

  return (
    <div className="relative w-full h-[500px]">
      <div className="absolute top-0 right-0 flex gap-4 text-xs font-mono mb-2 px-8">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-[var(--accent-green)] rounded-sm"></div> NPV Increases
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-[var(--accent-burgundy)] rounded-sm"></div> NPV Decreases
        </div>
      </div>
      <div ref={d3Container} className="w-full h-full relative" />
    </div>
  );
}
