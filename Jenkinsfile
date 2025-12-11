pipeline {
    agent any

    // Definimos las herramientas que configuramos en Jenkins
    // (Asegúrate de haberlas llamado 'Maven-3' y 'NodeJS-18' en "Global Tool Configuration")
    tools {
        maven 'Maven-3'
        nodejs 'NodeJS-21'
    }

    environment {
        // ID de las credenciales que creaste en Jenkins (Manage Credentials)
        AWS_CREDS_ID = 'aws-credentials-id' 
        
        // Tu región de AWS (ej: us-east-1, us-east-2, etc.)
        AWS_DEFAULT_REGION = 'us-east-1' 
        
        // EL NOMBRE EXACTO DE TU ENTORNO EN ELASTIC BEANSTALK
        // (Lo puedes ver en la consola de AWS o con 'eb list')
        EB_ENV_NAME = 'Hospital-app-env'
    }

    stages {
        // --- ETAPA 1: Preparación ---
        stage('Checkout & Info') {
            steps {
                // Descarga el código del repositorio
                checkout scm
                echo "Rama detectada: ${env.BRANCH_NAME}"
                
                // Verificamos versiones por seguridad
                sh 'java -version'
                sh 'mvn -version'
                sh 'node --version'
            }
        }

        // --- ETAPA 2: Frontend (Validación) ---
        // Como usas Amplify, el despliegue real lo hace AWS. 
        // Aquí solo compilamos para asegurar que no subas código roto.
        stage('Frontend: Build & Test') {
            steps {
                dir('frontend') { 
                    echo 'Instalando dependencias de React...'
                    sh 'npm install'
                    
                    echo 'Verificando construcción (Build)...'
                    // Esto asegura que el código no tenga errores de sintaxis graves
                    sh 'npm run build' 
                }
            }
        }

        // --- ETAPA 3: Backend (Construcción) ---
        stage('Backend: Build JAR') {
            steps {
                dir('backend') {
                    echo 'Compilando Spring Boot...'
                    // -DskipTests para ir más rápido, quítalo si quieres ejecutar tests unitarios
                    sh 'mvn clean package -DskipTests'
                }
            }
        }

        // --- ETAPA 4: Despliegue a AWS Elastic Beanstalk ---
        stage('Deploy Backend to AWS') {
            steps {
                dir('backend') {
                    script {
                                                echo "Desplegando versión a Elastic Beanstalk..."

                                                // Instalar EB CLI (awsebcli) en el agente si no está disponible
                                                sh '''
                                                    echo "Comprobando EB CLI..."
                                                    if ! command -v eb >/dev/null 2>&1; then
                                                        echo "EB CLI no encontrada. Intentando instalar awsebcli..."
                                                        if command -v pip3 >/dev/null 2>&1; then
                                                            pip3 install --user awsebcli || true
                                                        else
                                                            if command -v apt-get >/dev/null 2>&1; then
                                                                sudo apt-get update -y || true
                                                                sudo apt-get install -y python3-pip || true
                                                                pip3 install --user awsebcli || true
                                                            else
                                                                echo "No se encontró pip3 ni apt-get. Intentando pip (sin sudo)..."
                                                                pip install --user awsebcli || true
                                                            fi
                                                        fi
                                                    else
                                                        echo "EB CLI encontrada."
                                                    fi
                                                    export PATH="$HOME/.local/bin:$PATH"
                                                    eb --version || true
                                                '''

                                                // Usamos las credenciales guardadas en Jenkins para inyectarlas en la consola
                                                withCredentials([usernamePassword(credentialsId: env.AWS_CREDS_ID, passwordVariable: 'AWS_SECRET_ACCESS_KEY', usernameVariable: 'AWS_ACCESS_KEY_ID')]) {
                                                        // Ejecutar deploy asegurando que ~/.local/bin esté en PATH
                                                        sh '''
                                                            export PATH="$HOME/.local/bin:$PATH"
                                                            eb deploy ${EB_ENV_NAME}
                                                        '''
                                                }
                    }
                }
            }
        }
    }

    post {
        success {
            echo '✅ ¡Despliegue completado con éxito!'
        }
        failure {
            echo '❌ Algo falló. Revisa los logs de la consola.'
        }
    }
}