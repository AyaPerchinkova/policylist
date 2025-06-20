pipeline {
    agent {
        kubernetes {
            yaml '''
            kind: Pod
            spec:
              containers:
              - name: itest
                image: gbaas/itest:latest
                command:
                - cat
                tty: true
            '''
        }
    }
    
    stages {
        stage('Testing UI') {
            steps {
                container("itest") {
                        sh '''
                            npm install
                            npm test
                        '''
                }
            }
        }
        
    }
}
    