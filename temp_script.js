    
        // Global variables
        let dashboardData = [];
        let filteredData = [];

        // Load data and initialize dashboard
        async function loadData() {
            try {
                const response = await fetch('dashboard_data.json');
                dashboardData = await response.json();
                filteredData = [...dashboardData];
                
                initializeFilters();
                updateDashboard();
                showNotification('Dashboard carregado com sucesso!', 'success');
            } catch (error) {
                console.error('Erro ao carregar dados:', error);
                // Fallback data for demo
                generateSampleData();
                initializeFilters();
                updateDashboard();
                showNotification('Dashboard inicializado com dados de demonstração', 'warning');
            }
        }

        // Generate sample data if JSON file is not available
        function generateSampleData() {
            const categories = ['Customer', 'Spill', 'Injury', 'Transport', 'Equipment', 'Security', 'Divergence', 'Complaint'];
            const causes = ['Material', 'Procedure', 'Design', 'Training', 'Management', 'External', 'Equipment', 'Personnel'];
            const sites = ['Weston', 'Bolton', 'Shirley', 'Lincoln', 'Maynard', 'Acton', 'Concord', 'Hudson'];
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const years = [2007, 2008, 2009];
            const severities = ['Critical', 'Major', 'Medium', 'Near Miss'];
            const statuses = ['Open', 'Closed'];
            
            dashboardData = [];
            
            for (let year of years) {
                for (let month of months) {
                    for (let site of sites) {
                        for (let category of categories) {
                            for (let i = 0; i < 2; i++) {
                                const cause = causes[Math.floor(Math.random() * causes.length)];
                                const severity = severities[Math.floor(Math.random() * severities.length)];
                                const status = statuses[Math.floor(Math.random() * statuses.length)];
                                const count = Math.floor(Math.random() * 15) + 1;
                                
                                dashboardData.push({
                                    Category: category,
                                    Cause: cause,
                                    Site: site,
                                    Month: month,
                                    Year: year,
                                    Severity: severity,
                                    Status: status,
                                    Count: count
                                });
                            }
                        }
                    }
                }
            }
            
            filteredData = [...dashboardData];
        }

        // Initialize filter dropdowns
        function initializeFilters() {
            const filters = {
                categoriaFilter: 'Category',
                localFilter: 'Site',
                severidadeFilter: 'Severity',
                anoFilter: 'Year',
                causaFilter: 'Cause',
                statusFilter: 'Status'
            };

            Object.entries(filters).forEach(([filterId, field]) => {
                const select = document.getElementById(filterId);
                const uniqueValues = [...new Set(dashboardData.map(item => item[field]))].sort();
                
                // Clear existing options except the first one
                select.innerHTML = select.innerHTML.split('\n')[0];
                
                uniqueValues.forEach(value => {
                    const option = document.createElement('option');
                    option.value = value;
                    option.textContent = value;
                    select.appendChild(option);
                });
            });
        }

        // Apply filters to data
        function aplicarFiltros() {
            const filters = {
                Category: getSelectedValues('categoriaFilter'),
                Site: getSelectedValues('localFilter'),
                Severity: getSelectedValues('severidadeFilter'),
                Year: getSelectedValues('anoFilter').map(Number),
                Cause: getSelectedValues('causaFilter'),
                Status: getSelectedValues('statusFilter')
            };

            filteredData = dashboardData.filter(item => {
                return Object.entries(filters).every(([field, values]) => {
                    return values.length === 0 || values.includes(item[field]);
                });
            });

            updateDashboard();
            updateDashboard();
            showNotification(`Filtros aplicados! ${filteredData.length} registros encontrados.`);
        }

        // Reset all filters
        function resetarFiltros() {
            const filterIds = ['categoriaFilter', 'localFilter', 'severidadeFilter', 'anoFilter', 'causaFilter', 'statusFilter'];
            filterIds.forEach(id => {
                const select = document.getElementById(id);
                Array.from(select.options).forEach(option => option.selected = false);
            });

            filteredData = [...dashboardData];
            updateDashboard();
            showNotification('Filtros resetados!');
        }

        // Get selected values from multi-select
        function getSelectedValues(selectId) {
            const select = document.getElementById(selectId);
            return Array.from(select.selectedOptions)
                .map(option => option.value)
                .filter(value => value !== '');
        }

        // Update all dashboard components
        function updateDashboard() {
            updateStatistics();
            updateCharts();
        }

        // Update all charts
        function updateCharts() {
            updateCategoryChart();
            updateCauseChart();
            updateTrendChart();
            updateSiteChart();
            updateMonthChart();
            updateSeverityChart();
        }

        // Create bar chart using SVG with improved styling
        function createBarChart(svgId, data, colors = '#636efa') {
            const svg = document.getElementById(svgId);
            if (!svg) return;

            svg.innerHTML = '';
            
            const width = 300;
            const height = 300;
            const margin = { top: 20, right: 20, bottom: 70, left: 50 };
            const chartWidth = width - margin.left - margin.right;
            const chartHeight = height - margin.top - margin.bottom;

            const maxValue = Math.max(...data.map(d => d.value));
            const barWidth = chartWidth / data.length;

            // Chart group
            const chartGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            chartGroup.setAttribute('transform', `translate(${margin.left}, ${margin.top})`);

            // Background grid lines
            for (let i = 0; i <= 5; i++) {
                const y = (chartHeight / 5) * i;
                const gridLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                gridLine.setAttribute('x1', '0');
                gridLine.setAttribute('y1', y);
                gridLine.setAttribute('x2', chartWidth);
                gridLine.setAttribute('y2', y);
                gridLine.setAttribute('stroke', '#E5ECF6');
                gridLine.setAttribute('stroke-width', '1');
                chartGroup.appendChild(gridLine);

                // Y-axis labels
                const value = Math.round((maxValue * (5 - i)) / 5);
                const yLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                yLabel.setAttribute('x', '-10');
                yLabel.setAttribute('y', y + 4);
                yLabel.setAttribute('text-anchor', 'end');
                yLabel.setAttribute('class', 'chart-text');
                yLabel.setAttribute('font-size', '11');
                yLabel.setAttribute('fill', '#2a3f5f');
                yLabel.textContent = value.toLocaleString();
                chartGroup.appendChild(yLabel);
            }

            // Bars and labels
            data.forEach((item, index) => {
                const barHeight = (item.value / maxValue) * chartHeight;
                const x = index * barWidth + barWidth * 0.15;
                const y = chartHeight - barHeight;

                // Bar
                const bar = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                bar.setAttribute('x', x);
                bar.setAttribute('y', y);
                bar.setAttribute('width', barWidth * 0.7);
                bar.setAttribute('height', barHeight);
                bar.setAttribute('fill', colors);
                bar.setAttribute('class', 'chart-bar');
                bar.setAttribute('title', `${item.label}: ${item.value}`);
                bar.style.cursor = 'pointer';
                chartGroup.appendChild(bar);

                // Value label on top of bar
                const valueLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                valueLabel.setAttribute('x', x + (barWidth * 0.35));
                valueLabel.setAttribute('y', y - 5);
                valueLabel.setAttribute('text-anchor', 'middle');
                valueLabel.setAttribute('class', 'chart-text');
                valueLabel.setAttribute('font-size', '11');
                valueLabel.setAttribute('fill', '#2a3f5f');
                valueLabel.textContent = item.value.toLocaleString();
                chartGroup.appendChild(valueLabel);

                // X-axis labels
                const labelText = item.label.length > 8 ? item.label.substring(0, 8) + '...' : item.label;
                const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                label.setAttribute('x', x + (barWidth * 0.35));
                label.setAttribute('y', chartHeight + 20);
                label.setAttribute('text-anchor', 'middle');
                label.setAttribute('class', 'chart-text');
                label.setAttribute('font-size', '10');
                label.setAttribute('fill', '#2a3f5f');
                label.textContent = labelText;
                chartGroup.appendChild(label);
            });

            svg.appendChild(chartGroup);
            svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
        }

        // Create horizontal bar chart for locations
        function createHorizontalBarChart(svgId, data, colors = '#ab63fa') {
            const svg = document.getElementById(svgId);
            if (!svg) return;

            svg.innerHTML = '';
            
            const width = 300;
            const height = 300;
            const margin = { top: 20, right: 30, bottom: 20, left: 80 };
            const chartWidth = width - margin.left - margin.right;
            const chartHeight = height - margin.top - margin.bottom;

            const maxValue = Math.max(...data.map(d => d.value));
            const barHeight = chartHeight / data.length;

            // Chart group
            const chartGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            chartGroup.setAttribute('transform', `translate(${margin.left}, ${margin.top})`);

            // Background grid lines
            for (let i = 0; i <= 5; i++) {
                const x = (chartWidth / 5) * i;
                const gridLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                gridLine.setAttribute('x1', x);
                gridLine.setAttribute('y1', '0');
                gridLine.setAttribute('x2', x);
                gridLine.setAttribute('y2', chartHeight);
                gridLine.setAttribute('stroke', '#E5ECF6');
                gridLine.setAttribute('stroke-width', '1');
                chartGroup.appendChild(gridLine);
            }

            // Bars and labels
            data.forEach((item, index) => {
                const barWidth = (item.value / maxValue) * chartWidth;
                const x = 0;
                const y = index * barHeight + barHeight * 0.15;

                // Bar
                const bar = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                bar.setAttribute('x', x);
                bar.setAttribute('y', y);
                bar.setAttribute('width', barWidth);
                bar.setAttribute('height', barHeight * 0.7);
                bar.setAttribute('fill', colors);
                bar.setAttribute('class', 'chart-bar');
                bar.setAttribute('title', `${item.label}: ${item.value}`);
                chartGroup.appendChild(bar);

                // Value label at end of bar
                const valueLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                valueLabel.setAttribute('x', barWidth + 5);
                valueLabel.setAttribute('y', y + (barHeight * 0.45));
                valueLabel.setAttribute('text-anchor', 'start');
                valueLabel.setAttribute('class', 'chart-text');
                valueLabel.setAttribute('font-size', '11');
                valueLabel.setAttribute('fill', '#2a3f5f');
                valueLabel.textContent = item.value.toLocaleString();
                chartGroup.appendChild(valueLabel);

                // Y-axis labels
                const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                label.setAttribute('x', '-10');
                label.setAttribute('y', y + (barHeight * 0.45));
                label.setAttribute('text-anchor', 'end');
                label.setAttribute('class', 'chart-text');
                label.setAttribute('font-size', '10');
                label.setAttribute('fill', '#2a3f5f');
                label.textContent = item.label;
                chartGroup.appendChild(label);
            });

            svg.appendChild(chartGroup);
            svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
        }

        // Create line chart for temporal trends
        function createLineChart(svgId, data, colors = '#EF553B') {
            const svg = document.getElementById(svgId);
            if (!svg) return;

            svg.innerHTML = '';
            
            const width = 300;
            const height = 300;
            const margin = { top: 20, right: 20, bottom: 70, left: 50 };
            const chartWidth = width - margin.left - margin.right;
            const chartHeight = height - margin.top - margin.bottom;

            if (data.length === 0) return;

            const maxValue = Math.max(...data.map(d => d.value));
            const minValue = Math.min(...data.map(d => d.value));
            const xStep = chartWidth / (data.length - 1);

            // Chart group
            const chartGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            chartGroup.setAttribute('transform', `translate(${margin.left}, ${margin.top})`);

            // Background grid lines
            for (let i = 0; i <= 5; i++) {
                const y = (chartHeight / 5) * i;
                const gridLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                gridLine.setAttribute('x1', '0');
                gridLine.setAttribute('y1', y);
                gridLine.setAttribute('x2', chartWidth);
                gridLine.setAttribute('y2', y);
                gridLine.setAttribute('stroke', '#E5ECF6');
                gridLine.setAttribute('stroke-width', '1');
                chartGroup.appendChild(gridLine);
            }

            // Create path for line
            const pathData = data.map((item, index) => {
                const x = index * xStep;
                const y = chartHeight - ((item.value - minValue) / (maxValue - minValue)) * chartHeight;
                return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
            }).join(' ');

            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', pathData);
            path.setAttribute('fill', 'none');
            path.setAttribute('stroke', colors);
            path.setAttribute('stroke-width', '2');
            chartGroup.appendChild(path);

            // Add points
            data.forEach((item, index) => {
                const x = index * xStep;
                const y = chartHeight - ((item.value - minValue) / (maxValue - minValue)) * chartHeight;

                const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                circle.setAttribute('cx', x);
                circle.setAttribute('cy', y);
                circle.setAttribute('r', '3');
                circle.setAttribute('fill', colors);
                circle.setAttribute('title', `${item.label}: ${item.value}`);
                chartGroup.appendChild(circle);

                // X-axis labels
                if (index % Math.ceil(data.length / 6) === 0) {
                    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                    label.setAttribute('x', x);
                    label.setAttribute('y', chartHeight + 20);
                    label.setAttribute('text-anchor', 'middle');
                    label.setAttribute('class', 'chart-text');
                    label.setAttribute('font-size', '9');
                    label.setAttribute('fill', '#2a3f5f');
                    label.textContent = item.label.substring(0, 6);
                    chartGroup.appendChild(label);
                }
            });

            svg.appendChild(chartGroup);
            svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
        }
                label.setAttribute('class', 'chart-text');
                label.textContent = item.label.length > 8 ? item.label.substring(0, 8) + '...' : item.label;
                chartGroup.appendChild(label);
            });

            svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
            svg.appendChild(chartGroup);
        }

        // Create pie chart using SVG with improved styling
        function createPieChart(svgId, data) {
            const svg = document.getElementById(svgId);
            if (!svg) return;

            svg.innerHTML = '';
            
            const width = 300;
            const height = 300;
            const centerX = width / 2;
            const centerY = height / 2 - 20;
            const radius = Math.min(width, height) / 3;

            const total = data.reduce((sum, item) => sum + item.value, 0);
            const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#FF9FF3', '#54A0FF'];

            let currentAngle = -Math.PI / 2; // Start from top

            data.forEach((item, index) => {
                const percentage = item.value / total;
                const angle = percentage * 2 * Math.PI;
                const endAngle = currentAngle + angle;

                // Create path for pie slice
                const largeArcFlag = angle > Math.PI ? 1 : 0;
                const x1 = centerX + radius * Math.cos(currentAngle);
                const y1 = centerY + radius * Math.sin(currentAngle);
                const x2 = centerX + radius * Math.cos(endAngle);
                const y2 = centerY + radius * Math.sin(endAngle);

                const pathData = [
                    `M ${centerX} ${centerY}`,
                    `L ${x1} ${y1}`,
                    `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                    'Z'
                ].join(' ');

                const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                path.setAttribute('d', pathData);
                path.setAttribute('fill', colors[index % colors.length]);
                path.setAttribute('stroke', 'white');
                path.setAttribute('stroke-width', '2');
                path.setAttribute('class', 'pie-slice');
                path.setAttribute('title', `${item.label}: ${item.value} (${(percentage * 100).toFixed(1)}%)`);
                svg.appendChild(path);

                // Add percentage label
                const labelAngle = currentAngle + angle / 2;
                const labelRadius = radius * 0.7;
                const labelX = centerX + labelRadius * Math.cos(labelAngle);
                const labelY = centerY + labelRadius * Math.sin(labelAngle);

                if (percentage > 0.05) { // Only show label if slice is big enough
                    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                    label.setAttribute('x', labelX);
                    label.setAttribute('y', labelY);
                    label.setAttribute('text-anchor', 'middle');
                    label.setAttribute('class', 'chart-text');
                    label.setAttribute('fill', 'white');
                    label.setAttribute('font-weight', 'bold');
                    label.setAttribute('font-size', '12');
                    label.textContent = `${(percentage * 100).toFixed(1)}%`;
                    svg.appendChild(label);
                }

                currentAngle = endAngle;
            });

            // Add legend at the bottom
            const legendStartY = height - 80;
            const legendItemWidth = width / Math.min(data.length, 4);
            
            data.forEach((item, index) => {
                const row = Math.floor(index / 4);
                const col = index % 4;
                const legendX = col * legendItemWidth + 10;
                const legendY = legendStartY + row * 20;
                
                const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                rect.setAttribute('x', legendX);
                rect.setAttribute('y', legendY);
                rect.setAttribute('width', '12');
                rect.setAttribute('height', '12');
                rect.setAttribute('fill', colors[index % colors.length]);
                svg.appendChild(rect);

                const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                text.setAttribute('x', legendX + 16);
                text.setAttribute('y', legendY + 9);
                text.setAttribute('class', 'chart-text');
                text.setAttribute('font-size', '10');
                text.setAttribute('fill', '#2a3f5f');
                text.textContent = item.label.length > 8 ? item.label.substring(0, 8) + '...' : item.label;
                svg.appendChild(text);
            });

            svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
        }

        // Update category chart
        function updateCategoryChart() {
            const categoryData = groupBy(filteredData, 'Category', 'Count');
            const sortedData = Object.entries(categoryData)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 8)
                .map(([label, value]) => ({ label, value }));
            
            createBarChart('chartCategorySvg', sortedData, '#636efa');
        }

        // Update cause chart
        function updateCauseChart() {
            const causeData = groupBy(filteredData, 'Cause', 'Count');
            const sortedData = Object.entries(causeData)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 8)
                .map(([label, value]) => ({ label, value }));
            
            createBarChart('chartCauseSvg', sortedData, '#00cc96');
        }

        // Update trend chart (line chart for temporal trends)
        function updateTrendChart() {
            const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const trendData = {};
            
            filteredData.forEach(item => {
                const key = `${item.Year}-${item.Month}`;
                trendData[key] = (trendData[key] || 0) + item.Count;
            });

            const sortedTrends = Object.entries(trendData)
                .sort((a, b) => {
                    const [yearA, monthA] = a[0].split('-');
                    const [yearB, monthB] = b[0].split('-');
                    const dateA = new Date(yearA, monthOrder.indexOf(monthA));
                    const dateB = new Date(yearB, monthOrder.indexOf(monthB));
                    return dateA - dateB;
                })
                .slice(0, 12)
                .map(([label, value]) => ({ label, value }));

            createLineChart('chartTrendSvg', sortedTrends, '#EF553B');
        }

        // Update site chart (horizontal bars)
        function updateSiteChart() {
            const siteData = groupBy(filteredData, 'Site', 'Count');
            const sortedData = Object.entries(siteData)
                .sort((a, b) => b[1] - a[1])
                .map(([label, value]) => ({ label, value }));
            
            createHorizontalBarChart('chartSiteSvg', sortedData, '#ab63fa');
        }

        // Update month chart
        function updateMonthChart() {
            const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const monthData = groupBy(filteredData, 'Month', 'Count');
            
            const sortedData = monthOrder.map(month => ({
                label: month,
                value: monthData[month] || 0
            }));
            
            createBarChart('chartMonthSvg', sortedData, '#00cc96');
        }

        // Update severity chart
        function updateSeverityChart() {
            const severityData = groupBy(filteredData, 'Severity', 'Count');
            const sortedData = Object.entries(severityData)
                .map(([label, value]) => ({ label, value }));
            
            createPieChart('chartSeveritySvg', sortedData);
        }

        // Update statistics cards
        function updateStatistics() {
            const totalRecords = filteredData.length;
            const totalIncidents = filteredData.reduce((sum, item) => sum + item.Count, 0);
            const activeSites = new Set(filteredData.map(item => item.Site)).size;
            const years = [...new Set(filteredData.map(item => item.Year))].sort();
            const period = years.length > 0 ? `${Math.min(...years)} - ${Math.max(...years)}` : 'N/A';

            document.getElementById('totalRegistros').textContent = totalRecords.toLocaleString();
            document.getElementById('totalIncidentes').textContent = totalIncidents.toLocaleString();
            document.getElementById('totalLocais').textContent = activeSites;
            document.getElementById('periodo').textContent = period;
        }

        // Helper function to group data
        function groupBy(data, field, valueField) {
            const result = {};
            data.forEach(item => {
                const key = item[field];
                result[key] = (result[key] || 0) + item[valueField];
            });
            return result;
        }

        // Show notification
        function showNotification(message, type = 'success') {
            const notification = document.createElement('div');
            notification.className = 'notification';
            notification.textContent = message;
            
            if (type === 'warning') {
                notification.style.background = '#ed8936';
            }
            
            document.body.appendChild(notification);
            
            setTimeout(() => notification.classList.add('show'), 100);
            
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => document.body.removeChild(notification), 300);
            }, 3000);
        }

        // Initialize dashboard when page loads
        document.addEventListener('DOMContentLoaded', function() {
            loadData();
        });
    
