// =============================================
// 1. FRAGEN FÜR DEN STRESS-TEST (MIT UMLAUTEN)
// =============================================
const questions = [
    "Ich fühle mich Überlastet.",
    "Ich denke zu Hause ständig an die Arbeit.",
    "Ich kann nicht abschalten/bin nervös.",
    "Ich brauche Alkohol/Drogen/Tabletten, um runterzukommen.",
    "Ich bin schneller gereizt als üblich.",
    "Ich habe das Gefühl, nichts mehr richtig zu machen.",
    "Ich denke pessimistischer als sonst.",
    "Ich habe die Freude an meiner Arbeit verloren.",
    "Ich fühle mich nicht geschätzt.",
    "Ich bin gleichgültig geworden.",
    "Ich fühle mich frustriert oder deprimiert.",
    "Ich achte nicht auf meine Ernährung (hastig, ungesund, unregelmäß).",
    "Ich mache berstunden.",
    "Ich halte meine Pausenzeiten nicht ein.",
    "Ich fühle mich körperlich angeschlagen und ausgelaugt.",
    "Ich habe Schlafprobleme.",
    "Ich knirsche nachts mit den Zähnen (Bruxismus).",
    "Am Tag fühle ich mich abgeschlagen und kraftlos.",
    "Ich bin vergesslicher als sonst.",
    "Ich habe Konzentrationsprobleme.",
    "Ich mache mehr Fehler als sonst.",
    "Ich habe Muskelverspannungen, Nacken- oder Rückenschmerzen.",
    "Ich beiße tagsüber oft die Zähne zusammen.",
    "Ich habe Kopfschmerzen.",
    "Ich habe Verdauungsprobleme (Magendruck, Bauchschmerzen usw.)."
];

// =============================================
// 2. DOM-ELEMENTE LADEN (NUR NACH DOMContentLoaded)
// =============================================
document.addEventListener('DOMContentLoaded', () => {
    // DOM-Elemente
    const form = document.getElementById('stress-form');
    const scoreElement = document.getElementById('score');
    const stressLevelElement = document.getElementById('stress-level');
    const saveButton = document.getElementById('save-result');
    const exportButton = document.getElementById('export-data');
    const clearButton = document.getElementById('clear-data');
    const historyBody = document.getElementById('history-body');

    // Array für die Antworten (Standard: 0)
    let answers = new Array(questions.length).fill(0);

    // Lade historische Ergebnisse aus localStorage
    let history = JSON.parse(localStorage.getItem('stressTestHistory')) || [];

    // Initialisiere das Diagramm
    let stressChart;

    // =============================================
    // 3. FRAGEN DYNAMISCH IN DAS FORMULAR EINFÜGEN
    // =============================================
    questions.forEach((question, index) => {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'question';
        questionDiv.innerHTML = `
            <label>${question}</label>
            <div class="options" data-index="${index}">
                <button type="button" data-value="0">0</button>
                <button type="button" data-value="1">1</button>
                <button type="button" data-value="2">2</button>
                <button type="button" data-value="3">3</button>
                <button type="button" data-value="4">4</button>
            </div>
        `;
        form.appendChild(questionDiv);
    });

    // =============================================
    // 4. EVENT-LISTENER FÜR DIE BUTTONS
    // =============================================
    document.querySelectorAll('.options button').forEach(button => {
        button.addEventListener('click', () => {
            const optionsDiv = button.closest('.options');
            const index = parseInt(optionsDiv.dataset.index);
            const value = parseInt(button.dataset.value);

            // Antwort aktualisieren
            answers[index] = value;

            // Ausgewählten Button markieren
            optionsDiv.querySelectorAll('button').forEach(btn => {
                btn.classList.remove('selected');
            });
            button.classList.add('selected');

            // Gesamtpunktzahl aktualisieren
            updateTotalScore();
        });
    });

    // =============================================
    // 5. GESAMTPUNKTZAHL UND STRESSLEVEL AKTUALISIEREN
    // =============================================
    function updateTotalScore() {
        const totalScore = answers.reduce((sum, answer) => sum + answer, 0);
        scoreElement.textContent = totalScore;
        stressLevelElement.textContent = getStressLevelDescription(totalScore);
    }

    // Stresslevel-Beschreibung zurückgeben
    function getStressLevelDescription(score) {
        if (score < 10) return "Niedriges Stresslevel 😊";
        if (score < 20) return "Mäßiges Stresslevel 😐";
        if (score < 30) return "Hohes Stresslevel 😕";
        if (score < 40) return "Sehr hohes Stresslevel 😨";
        return "Extrem hohes Stresslevel 😱";
    }

    // =============================================
    // 6. ERGEBNIS SPEICHERN
    // =============================================
    function saveResult() {
        const totalScore = answers.reduce((sum, answer) => sum + answer, 0);
        const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD

        // Prüfe, ob heute bereits ein Ergebnis gespeichert wurde
        const existingEntryIndex = history.findIndex(entry => entry.date === today);

        if (existingEntryIndex !== -1) {
            // Überschreibe das bestehende Ergebnis für heute
            history[existingEntryIndex] = {
                date: today,
                score: totalScore,
                level: getStressLevelDescription(totalScore)
            };
        } else {
            // Füge neues Ergebnis hinzu
            history.push({
                date: today,
                score: totalScore,
                level: getStressLevelDescription(totalScore)
            });
        }

        // Speichere im localStorage
        localStorage.setItem('stressTestHistory', JSON.stringify(history));

        // Aktualisiere die Tabelle und das Diagramm
        updateHistoryTable();
        updateChart();

        // Zeige Bestätigung
        alert('Ergebnis gespeichert! 🎉');
    }

    // =============================================
    // 7. TABELLE MIT HISTORISCHEN ERGEBNISSEN AKTUALISIEREN
    // =============================================
    function updateHistoryTable() {
        // Sortiere nach Datum (neueste zuerst)
        history.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Begrenze auf die letzten 6 Monate
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const filteredHistory = history.filter(entry => {
            const entryDate = new Date(entry.date);
            return entryDate >= sixMonthsAgo;
        });

        // Tabelle aktualisieren
        historyBody.innerHTML = '';
        filteredHistory.forEach(entry => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${formatDate(entry.date)}</td>
                <td>${entry.score}</td>
                <td>${entry.level}</td>
            `;
            historyBody.appendChild(row);
        });
    }

    // =============================================
    // 8. DATUM FORMATIEREN (DD.MM.YYYY)
    // =============================================
    function formatDate(dateString) {
        const [year, month, day] = dateString.split('-');
        return `${day}.${month}.${year}`;
    }

    // =============================================
    // 9. DIAGRAMM AKTUALISIEREN
    // =============================================
    function updateChart() {
        // Sortiere nach Datum (chronologisch)
        history.sort((a, b) => new Date(a.date) - new Date(b.date));

        // Begrenze auf die letzten 6 Monate
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const filteredHistory = history.filter(entry => {
            const entryDate = new Date(entry.date);
            return entryDate >= sixMonthsAgo;
        });

        // Daten für das Diagramm vorbereiten
        const dates = filteredHistory.map(entry => formatDate(entry.date));
        const scores = filteredHistory.map(entry => entry.score);

        // Diagramm erstellen oder aktualisieren
        const ctx = document.getElementById('stressChart').getContext('2d');

        if (stressChart) {
            stressChart.destroy(); // Altes Diagramm löschen
        }

        stressChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [{
                    label: 'Stress-Test Punkte',
                    data: scores,
                    borderColor: '#007BFF',
                    backgroundColor: 'rgba(0, 123, 255, 0.1)',
                    borderWidth: 2,
                    tension: 0.3,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Punkte'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Datum'
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Stress-Test Trend (letzte 6 Monate)',
                        font: {
                            size: 16
                        }
                    },
                    legend: {
                        position: 'top'
                    }
                }
            }
        });
    }

    // =============================================
    // 10. DATEN EXPORTIEREN (CSV)
    // =============================================
    function exportData() {
        if (history.length === 0) {
            alert("Keine Daten zum Exportieren!");
            return;
        }

        // CSV-Header
        let csv = "Datum;Punkte;Stresslevel\n";

        // Daten hinzufügen (Semikolon als Trennzeichen für deutsche Excel-Versionen)
        history.forEach(entry => {
            csv += `"${formatDate(entry.date)}";"${entry.score}";"${entry.level}"\n`;
        });

        // CSV-Datei herunterladen
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'stress-test-daten.csv';
        a.click();
        URL.revokeObjectURL(url);
    }

    // =============================================
    // 11. DATEN LÖSCHEN
    // =============================================
    function clearData() {
        if (confirm("Möchtest du wirklich alle historischen Daten löschen?")) {
            localStorage.removeItem('stressTestHistory');
            history = [];
            updateHistoryTable();
            updateChart();
            alert("Alle Daten wurden gelöscht!");
        }
    }

    // =============================================
    // 12. EVENT-LISTENER FÜR BUTTONS
    // =============================================
    saveButton.addEventListener('click', saveResult);
    exportButton.addEventListener('click', exportData);
    clearButton.addEventListener('click', clearData);

    // =============================================
    // 13. INITIALE DATEN LADEN
    // =============================================
    updateHistoryTable();
    updateChart();
});