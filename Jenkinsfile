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
                    // Instalamos dependencias y forzamos la URL de la API del frontend a usar el puerto 8080
                    sh '''
                      echo "Instalando dependencias de React..."
                      npm install
                      echo "Construyendo frontend con VITE_API_URL=http://localhost:8080"
                      # Forzar variable para que la build apunte al backend en :8080
                      VITE_API_URL="http://localhost:8080" npm run build
                    '''
                }
            }
        }

        // --- ETAPA 3: Backend (Construcción) ---
        stage('Backend: Build JAR') {
            steps {
                dir('backend') {
                    echo 'Compilando Spring Boot...'
                                        // Forzar que el archivo de propiedades use el puerto 5000 para esta build
                                        sh '''
                                            FILE=src/main/resources/application.properties
                                            echo "Ajustando server.port=5000 en $FILE (si existe lo reemplaza, si no lo añade)"
                                            if [ -f "$FILE" ]; then
                                                if grep -q '^server.port=' "$FILE"; then
                                                    sed -i.bak 's/^server.port=.*/server.port=5000/' "$FILE" || true
                                                else
                                                    echo "server.port=5000" >> "$FILE"
                                                fi
                                                echo "Contenido actual de $FILE:" && cat "$FILE"
                                            else
                                                echo "$FILE no encontrado, creando con server.port=5000" && mkdir -p $(dirname "$FILE") && echo "server.port=5000" > "$FILE"
                                            fi
                                        '''
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

                                                // Instalar EB CLI (awsebcli) en un virtualenv dentro del workspace si no está disponible
                                                // Esto evita depender de sudo o de rutas globales y funciona con el usuario 'jenkins'.
                                                sh '''
                                                    echo "Comprobando EB CLI..."
                                                    if command -v eb >/dev/null 2>&1; then
                                                        echo "EB CLI ya está disponible:" $(which eb)
                                                        eb --version || true
                                                    else
                                                        echo "EB CLI no encontrada. Creando virtualenv e instalando awsebcli en el workspace..."
                                                        # Asegurarse de tener python3 y venv
                                                        if ! command -v python3 >/dev/null 2>&1; then
                                                            echo "python3 no encontrado. Abortando instalación local de awsebcli." >&2
                                                        else
                                                            python3 -m venv .venv_awseb || true
                                                            . .venv_awseb/bin/activate
                                                            pip install --upgrade pip setuptools wheel || true
                                                            pip install --no-cache-dir awsebcli || true
                                                            echo "Contenido de .venv_awseb/bin:" && ls -la .venv_awseb/bin || true
                                                            eb --version || true
                                                        fi
                                                    fi
                                                '''

                                                // Usamos las credenciales guardadas en Jenkins para inyectarlas en la consola
                                                withCredentials([usernamePassword(credentialsId: env.AWS_CREDS_ID, passwordVariable: 'AWS_SECRET_ACCESS_KEY', usernameVariable: 'AWS_ACCESS_KEY_ID')]) {
                                                        // Ejecutar deploy usando el virtualenv si existe, o el eb del PATH
                                                        sh '''
                                                            if [ -f .venv_awseb/bin/activate ]; then
                                                                . .venv_awseb/bin/activate
                                                            fi
                                                            echo "Usando eb en:" $(command -v eb || echo 'no encontrado')
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