// Referências ao DOM
const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const taskDate = document.getElementById("task-date");
const taskList = document.getElementById("task-list");
const toggleOrderButton = document.getElementById("toggle-order");
const taskSummary = document.getElementById("task-summary");
const errorMessage = document.getElementById("error-message");

let isAscending = true; // Estado inicial de ordenação (ascendente)

// Função para alternar a ordenação
toggleOrderButton.addEventListener("click", () => {
    isAscending = !isAscending;
    toggleOrderButton.textContent = `Ordenar: ${isAscending ? "Ascendente" : "Descendente"}`;
    ordenarTarefas();
});


// Função para animar o incremento dos números
function animarNumero(element, valorFinal) {
    const duracao = 500; // Duração da animação em milissegundos
    const incremento = valorFinal / (duracao / 16); // Incremento por frame (~60 FPS)
    let valorAtual = 0;

    const animacao = setInterval(() => {
        valorAtual += incremento;
        if (valorAtual >= valorFinal) {
            clearInterval(animacao); // Interrompe a animação ao atingir o valor final
            element.textContent = Math.round(valorFinal); // Define o valor final exato
        } else {
            element.textContent = Math.round(valorAtual); // Atualiza para o valor arredondado
        }
    }, 16); // Atualização a cada 16ms (~60 FPS)
}

// Função para atualizar o resumo de tarefas e a barra de progresso com controle do botão de reset
function atualizarResumo() {
    const total = taskList.children.length;
    const concluidas = Array.from(taskList.children).filter(task =>
        task.classList.contains("completed")
    ).length;

    // Atualiza o texto do resumo com animação
    const totalElement = document.querySelector("#task-summary .total");
    const concluidasElement = document.querySelector("#task-summary .completed");

    if (totalElement && concluidasElement) {
        animarNumero(totalElement, total);
        animarNumero(concluidasElement, concluidas);
    } else {
        taskSummary.innerHTML = `
            Total: <span class="total">0</span> | 
            Concluídas: <span class="completed">0</span>
        `;
        atualizarResumo(); // Reexecuta para garantir os elementos certos
    }

    // Calcula e atualiza o progresso
    const progresso = total > 0 ? (concluidas / total) * 100 : 0;
    const progressBar = document.getElementById("progress-bar");
    progressBar.style.width = `${progresso}%`;

    // Define as cores da barra de progresso com base no progresso
    progressBar.classList.remove("low-progress", "medium-progress", "high-progress");
    if (progresso < 50) {
        progressBar.classList.add("low-progress"); // Vermelho
    } else if (progresso <= 80) {
        progressBar.classList.add("medium-progress"); // Amarelo
    } else {
        progressBar.classList.add("high-progress"); // Verde
    }

    // Oculta ou exibe o botão de reset com base nas tarefas concluídas
    const resetProgressButton = document.getElementById("reset-progress");
    if (concluidas === 0) {
        resetProgressButton.classList.add("hidden");
    } else {
        resetProgressButton.classList.remove("hidden");
    }
}

// Função para mostrar mensagem de erro personalizada
function mostrarErro(mensagem) {
    errorMessage.textContent = mensagem;
    errorMessage.classList.add("visible");
    setTimeout(() => {
        errorMessage.classList.remove("visible");
    }, 3000); // Remove após 3 segundos
}

// Evento de submissão do formulário
taskForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const taskText = taskInput.value.trim();
    const taskDateValue = taskDate.value;

    if (!taskText) {
        mostrarErro("Por favor, insira uma descrição para a tarefa.");
        return;
    }

    if (!validarData(taskDateValue)) {
        mostrarErro("Por favor, insira uma data válida (não no passado).");
        return;
    }

    if (isDataDuplicada(taskDateValue)) {
        mostrarErro("Já existe uma tarefa com essa data.");
        return;
    }

    adicionarTarefa(taskText, taskDateValue);
    ordenarTarefas();
    atualizarResumo();

    // Limpa os campos do formulário
    taskInput.value = "";
    taskDate.value = "";
});

// Função para adicionar a tarefa à lista
function adicionarTarefa(taskText, taskDateValue) {
    const li = document.createElement("li");

    // Elemento para o texto da tarefa
    const taskSpan = document.createElement("span");
    taskSpan.textContent = `${taskText} (${formatarData(taskDateValue)})`;

    const buttons = document.createElement("div");
    buttons.className = "task-buttons";

    // Botão de concluir/desmarcar
    const completeBtn = document.createElement("button");
    completeBtn.textContent = "Concluir";
    completeBtn.className = "complete";
    completeBtn.onclick = () => {
        li.classList.toggle("completed");
        completeBtn.textContent = li.classList.contains("completed") ? "Desmarcar" : "Concluir";
        completeBtn.style.backgroundColor = li.classList.contains("completed") ? "#495057" : "#0d6efd";
        atualizarResumo(); // Atualiza resumo ao concluir/desmarcar
    };

    // Botão de excluir
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Excluir";
    deleteBtn.className = "delete";
    deleteBtn.onclick = () => {
        li.classList.add("removing");
        setTimeout(() => {
            taskList.removeChild(li);
            atualizarResumo(); // Atualiza resumo ao excluir
        }, 300);
    };

    buttons.appendChild(completeBtn);
    buttons.appendChild(deleteBtn);

    li.appendChild(taskSpan);
    li.appendChild(buttons);

    taskList.appendChild(li);
}

// Função para verificar duplicatas de data
function isDataDuplicada(taskDateValue) {
    const tasks = Array.from(taskList.children);
    return tasks.some((task) => {
        const taskDateText = task.querySelector("span").textContent;
        const taskDateString = taskDateText.match(/\((\d{2}\/\d{2}\/\d{4})\)/)[1];
        const existingDate = parseDate(taskDateString);
        const newDate = new Date(taskDateValue);
        return existingDate.getTime() === newDate.getTime();
    });
}

// Função para ordenar as tarefas
function ordenarTarefas() {
    const tasks = Array.from(taskList.children);

    tasks.sort((a, b) => {
        const dateA = parseDate(a.querySelector("span").textContent.match(/\((\d{2}\/\d{2}\/\d{4})\)/)[1]);
        const dateB = parseDate(b.querySelector("span").textContent.match(/\((\d{2}\/\d{2}\/\d{4})\)/)[1]);
        return isAscending ? dateA - dateB : dateB - dateA;
    });

    tasks.forEach(task => taskList.appendChild(task));
}

// Função para validar se a data é válida (não no passado)
function validarData(data) {
    const today = new Date();
    const selectedDate = new Date(data);
    today.setHours(0, 0, 0, 0);
    return selectedDate >= today;
}

// Função para formatar a data no formato "dd/mm/aaaa"
function formatarData(data) {
    const [ano, mes, dia] = data.split("-");
    return `${dia}/${mes}/${ano}`;
}

// Função para converter data no formato "dd/mm/aaaa" para objeto Date
function parseDate(dateString) {
    const [dia, mes, ano] = dateString.split("/").map(Number);
    return new Date(ano, mes - 1, dia);
}

// Referência ao botão de reset
const resetProgressButton = document.getElementById("reset-progress");

// Evento para resetar o progresso com confirmação
resetProgressButton.addEventListener("click", () => {
    const confirmar = confirm("Tem certeza de que deseja resetar o progresso?");

    if (confirmar) {
        // Itera sobre todas as tarefas e remove a classe "completed"
        Array.from(taskList.children).forEach(task => {
            if (task.classList.contains("completed")) {
                task.classList.remove("completed");
                const completeBtn = task.querySelector(".complete");
                completeBtn.textContent = "Concluir";
                completeBtn.style.backgroundColor = "#007bff"; // Restaura a cor do botão "Concluir"
            }
        });

        // Atualiza o resumo e a barra de progresso
        atualizarResumo();
    }
});

